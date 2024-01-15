using IdentityApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using Microsoft.Identity.Web.Resource;

namespace IdentityApi.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class TodoListController(TodoContext db) : ControllerBase
{
    const string AppRead = "AzureAD:AppPermissions:Read";
    const string AppWrite = "AzureAD:AppPermissions:Write";
    const string ScopeRead = "AzureAD:Scopes:Read";
    const string ScopeWrite = "AzureAD:Scopes:Write";

    private readonly TodoContext db = db;
    private string? UserId => HttpContext.User.GetObjectId();

    /// <summary>
    /// Indicates if the AT presented has application or delegated permissions.
    /// </summary>
    private bool IsAppOnlyToken() => HttpContext.User.Claims.Any(c => c.Type == "idtyp")
        ? HttpContext.User.Claims.Any(c =>
            c.Type == "idtyp" && c.Value == "app"
        )
        : HttpContext.User.Claims.Any(c =>
            c.Type == "roles" && !HttpContext.User.Claims.Any(c => c.Type == "scp")
        );

    private bool IsOwner(int id) =>
        db.TodoItems.Any(x =>
            x.Id == id
            && x.Owner == UserId
        );

    // GET: api/todoList
    [HttpGet]
    /// <summary>
    /// Access tokens that have neither the 'scp' (for delegated permissions) nor
    /// 'roles' (for application permissions) claim are note to be honored.
    /// 
    /// An access token issued by Azure AD will have at least one of the two claims. Access tokens
    /// issued to a user will have the 'scp' claim. Access tokens issued to an application will have
    /// the roles claim. Access tokens that contain both claims are issued only to users, where the scp
    /// claim designates the delegated permissions, while the roles claim desingates the user's role.
    /// 
    /// To determine whether an access token was issued to a user (i.e. delegated) or an application
    /// more easily, we recommend enabling the optional claim 'idtyp'. For more information, see:
    /// https://docs.microsoft.com/azure/active-directory/develop/access-tokens#user-and-applicatino-tokens
    /// </summary>
    [RequiredScopeOrAppPermission(
        RequiredScopesConfigurationKey = ScopeRead,
        RequiredAppPermissionsConfigurationKey = AppRead
    )]
    public async Task<ActionResult<IEnumerable<TodoItem>>> GetTodoItems() =>
        /// <summary>
        /// The 'oid' (object id) is the only claim that should be used to uniquely identify
        /// a user in an Azure AD tenant. The token might have one or more of the following claim,
        /// that might seem like a unique identifier, but is not and should not be used as such:
        /// 
        /// - upn (user principal name): might be unique amognst the active set of users in a tenant
        /// but tend to get reassigned to new employees as employees leave the organization and others
        /// take their place or might change to reflect a personal change like marriage.
        /// 
        /// - email: might be unique amongst the active set of users in a tenant but tend to get reassigned
        /// to new employees as employees leave the organization and others take their place.
        /// </summary>
        IsAppOnlyToken()
            ? await db.TodoItems.ToListAsync()
            : await db.TodoItems
                .Where(x => x.Owner == UserId)
                .ToListAsync();

    // GET: api/todoList/5
    [HttpGet("{id:int}")]
    [RequiredScopeOrAppPermission(
        RequiredScopesConfigurationKey = ScopeRead,
        RequiredAppPermissionsConfigurationKey = AppRead
    )]
    public async Task<ActionResult<TodoItem?>> GetTodoItem(int id) =>
        // if it only has delegated permissions, must be owner
        IsAppOnlyToken()
            ? await db.TodoItems.FirstOrDefaultAsync(x => x.Id == id)
            : await db.TodoItems.FirstOrDefaultAsync(x =>
                x.Id == id
                && x.Owner == UserId
            );
    
    // PUT: api/todoList/5
    [HttpPut("{id:int}")]
    [RequiredScopeOrAppPermission(
        RequiredScopesConfigurationKey = ScopeWrite,
        RequiredAppPermissionsConfigurationKey = AppWrite        
    )]
    public async Task<IActionResult> PutTodoItem(int id, TodoItem todoItem)
    {
        if (id != todoItem.Id || !db.TodoItems.Any(x => x.Id == id))
            return NotFound();

        if (IsAppOnlyToken() || IsOwner(id))
        {
            if (IsOwner(id))
            {
                db.Entry(todoItem).State = EntityState.Modified;
                
                try
                {
                    await db.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!db.TodoItems.Any(x => x.Id == id))
                        return NotFound();
                    else
                        throw;
                }
            }
        }

        return NoContent();
    }

    // POST: api/todoList
    [HttpPost]
    [RequiredScopeOrAppPermission(
        RequiredScopesConfigurationKey = ScopeWrite,
        RequiredAppPermissionsConfigurationKey = AppWrite
    )]
    public async Task<IActionResult> PostTodoItem(TodoItem todoItem)
    {
        string owner = UserId!;

        if (IsAppOnlyToken())
            // any owner is accepted with app permissions
            owner = todoItem.Owner;

        todoItem.Owner = owner;
        todoItem.Status = false;

        db.TodoItems.Add(todoItem);
        await db.SaveChangesAsync();

        return CreatedAtAction("GetTodoItem", new { id = todoItem.Id }, todoItem);
    }

    // DELETE: api/todoList/5
    [HttpDelete("{id:int}")]
    [RequiredScopeOrAppPermission(
        RequiredScopesConfigurationKey = ScopeWrite,
        RequiredAppPermissionsConfigurationKey = AppWrite
    )]
    public async Task<IActionResult> DeleteTodoItem(int id)
    {
        TodoItem? todoItem = await db.TodoItems.FindAsync(id);

        if (todoItem is null)
            return NotFound();

        if (IsAppOnlyToken() || IsOwner(id))
        {
            db.TodoItems.Remove(todoItem);
            await db.SaveChangesAsync();
        }

        return NoContent();
    }
}