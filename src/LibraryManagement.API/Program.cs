using System.Text;
using LibraryManagement.API.Middlewares;
using LibraryManagement.Application.Extensions;
using LibraryManagement.Application.Settings;
using LibraryManagement.Infrastructure.Extensions;
using LibraryManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Serilog;

// ─────────────────────────────────────────────────────────────
//  Bootstrap Serilog before the host builds so startup errors
//  are also captured in structured logs.
// ─────────────────────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting Library Management System API...");

    var builder = WebApplication.CreateBuilder(args);

    // ─── Serilog ───────────────────────────────────────────────
    builder.Host.UseSerilog((ctx, services, configuration) =>
        configuration.ReadFrom.Configuration(ctx.Configuration)
                     .ReadFrom.Services(services)
                     .Enrich.FromLogContext());

    // ─── Infrastructure (EF Core + Identity + UoW) ─────────────
    builder.Services.AddInfrastructureServices(builder.Configuration);

    // ─── Strongly-typed settings ───────────────────────────────
    builder.Services.Configure<JwtSettings>(
        builder.Configuration.GetSection(JwtSettings.SectionName));
    builder.Services.Configure<EmailSettings>(
        builder.Configuration.GetSection(EmailSettings.SectionName));

    // ─── JWT Authentication ────────────────────────────────────
    var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()!;
    var keyBytes = Encoding.UTF8.GetBytes(jwtSettings.Secret);

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    })
    .AddGoogle(options =>
    {
        options.ClientId = builder.Configuration["GoogleAuthSettings:ClientId"] ?? string.Empty;
        options.ClientSecret = builder.Configuration["GoogleAuthSettings:ClientSecret"] ?? string.Empty;
    });

    // ─── Authorization ─────────────────────────────────────────
    builder.Services.AddAuthorization();

    // ─── Controllers + JSON ────────────────────────────────────
    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy =
                System.Text.Json.JsonNamingPolicy.CamelCase;
        });

    // ─── Swagger / OpenAPI ─────────────────────────────────────
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "Library Management System API",
            Version = "v1",
            Description = "A comprehensive Library Management System built with .NET 10 and ASP.NET Core Web API",
            Contact = new OpenApiContact
            {
                Name = "Library Admin",
                Email = "admin@libraryms.com"
            }
        });

        // Include XML comments in Swagger
        var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        if (File.Exists(xmlPath))
            options.IncludeXmlComments(xmlPath);

        // JWT security definition
        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Enter your JWT token. Example: Bearer eyJhbGci..."
        });

        // Swashbuckle 10+ AddSecurityRequirement takes a factory func
        options.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecuritySchemeReference("Bearer"),
                new List<string>()
            }
        });
    });

    // ─── CORS ──────────────────────────────────────────────────
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAll", policy =>
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader());
    });

    // ─── HTTP Context Accessor ─────────────────────────────────
    builder.Services.AddHttpContextAccessor();

    // ─── Application Services ──────────────────────────────────
    builder.Services.AddApplicationServices();

    // ─────────────────────────────────────────────────────────────
    var app = builder.Build();
    // ─────────────────────────────────────────────────────────────

    // ─── Global Exception Middleware (must be FIRST) ────────────
    app.UseMiddleware<GlobalExceptionMiddleware>();

    // ─── Serilog request logging ────────────────────────────────
    app.UseSerilogRequestLogging(opts =>
    {
        opts.MessageTemplate =
            "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
    });

    // ─── Swagger (enabled for all environments in this portfolio)
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Library Management System API v1");
        options.DocumentTitle = "Library Management System - API Docs";
    });

    app.UseHttpsRedirection();

    app.UseCors("AllowAll");

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    // ─── Apply EF Core migrations + Seed data on startup ───────
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();
        await LibraryManagement.Infrastructure.Persistence.DbSeeder.SeedAsync(scope.ServiceProvider);
    }

    await app.RunAsync();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Fatal(ex, "Host terminated unexpectedly.");
}
finally
{
    await Log.CloseAndFlushAsync();
}
