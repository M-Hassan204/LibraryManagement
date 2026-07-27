using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LibraryManagement.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionsAndBranches : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DailyReadingLimits_Books_BookId",
                table: "DailyReadingLimits");

            migrationBuilder.DropIndex(
                name: "IX_DailyReadingLimits_BookId",
                table: "DailyReadingLimits");

            migrationBuilder.RenameColumn(
                name: "BookId",
                table: "DailyReadingLimits",
                newName: "PagesRead");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PagesRead",
                table: "DailyReadingLimits",
                newName: "BookId");

            migrationBuilder.CreateIndex(
                name: "IX_DailyReadingLimits_BookId",
                table: "DailyReadingLimits",
                column: "BookId");

            migrationBuilder.AddForeignKey(
                name: "FK_DailyReadingLimits_Books_BookId",
                table: "DailyReadingLimits",
                column: "BookId",
                principalTable: "Books",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
