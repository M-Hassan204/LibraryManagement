using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LibraryManagement.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSubscriptionPlanEnum : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                BEGIN TRY
                    BEGIN TRAN;

                    IF EXISTS (SELECT 1 FROM Subscriptions WHERE [Plan] NOT IN (0, 1))
                    BEGIN
                        THROW 50000, 'Data corruption risk: Subscriptions table contains [Plan] values other than 0 (Free) and 1 (Premium). Aborting migration.', 1;
                    END

                    -- Shift Premium (1) to (2)
                    UPDATE Subscriptions SET [Plan] = 2 WHERE [Plan] = 1;
                    
                    -- Shift Free (0) to (1)
                    UPDATE Subscriptions SET [Plan] = 1 WHERE [Plan] = 0;

                    COMMIT TRAN;
                END TRY
                BEGIN CATCH
                    IF @@TRANCOUNT > 0
                        ROLLBACK TRAN;
                    THROW;
                END CATCH
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                BEGIN TRY
                    BEGIN TRAN;

                    -- Shift Free (1) back to (0)
                    UPDATE Subscriptions SET [Plan] = 0 WHERE [Plan] = 1;
                    
                    -- Shift Premium (2) back to (1)
                    UPDATE Subscriptions SET [Plan] = 1 WHERE [Plan] = 2;

                    COMMIT TRAN;
                END TRY
                BEGIN CATCH
                    IF @@TRANCOUNT > 0
                        ROLLBACK TRAN;
                    THROW;
                END CATCH
            ");
        }
    }
}
