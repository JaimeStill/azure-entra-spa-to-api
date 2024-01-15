using Microsoft.EntityFrameworkCore;

namespace IdentityApi.Data
{
    public class TodoContext(DbContextOptions<TodoContext> options) : DbContext(options)
    {
        public DbSet<TodoItem> TodoItems { get; set; }
    }
}
