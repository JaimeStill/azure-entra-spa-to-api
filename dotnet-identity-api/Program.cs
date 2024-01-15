using IdentityApi.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using Microsoft.IdentityModel.Logging;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder
    .Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(options =>
    {
        builder.Configuration.Bind("AzureAd", options);
        options.Events = new JwtBearerEvents();

        /// <summary>
        /// Below you can do extended token validation and check for additional claims, such as:
        ///
        /// - check if the caller's tenant is in the allowed tenants list via the 'tid' claim (for multi-tenant applications)
        /// - check if the caller's account is homed or guest via the 'acct' optional claim
        /// - check if the caller belongs to right roles or groups via the 'roles' or 'groups' claim, respectively
        ///
        /// Bear in mind that you can do any of the above checks within the individual routes and/or controllers as well.
        /// For more information, visit: https://docs.microsoft.com/azure/active-directory/develop/access-tokens#validate-the-user-has-permission-to-access-this-data
        /// </summary>
        
        //options.Events.OnTokenValidated = async context =>
        //{
        //    string[] allowedClientApps = { /* list of client ids to allow */ };

        //    string clientappId = context?.Principal?.Claims
        //        .FirstOrDefault(x => x.Type == "azp" || x.Type == "appid")?.Value;

        //    if (!allowedClientApps.Contains(clientappId))
        //    {
        //        throw new System.Exception("This client is not authorized");
        //    }
        //};
    }, options => { builder.Configuration.Bind("AzureAd", options); });

// The following flag can be used to get more descriptive errors in development environments
IdentityModelEventSource.ShowPII = false;

builder.Services.AddDbContext<TodoContext>(opt => opt.UseInMemoryDatabase("TodoList"));
builder.Services.AddControllers();
builder.Services.AddCors(o => o.AddPolicy("default", builder =>
{
    builder.AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader();
}));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts();
}

app.UseCors("default");
app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
