using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.Laboratorio.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialLaboratorio : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(name: "laboratorio");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP SCHEMA IF EXISTS [laboratorio];");
        }
    }
}
