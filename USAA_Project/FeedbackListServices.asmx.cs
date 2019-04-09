using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;

//we need these to talk to mysql
using MySql.Data;
using MySql.Data.MySqlClient;
//and we need this to manipulate data from a db
using System.Data;

namespace USAA_Project
{
    /// <summary>
    /// Summary description for FeedbackListServices
    /// </summary>
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    // To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
    [System.Web.Script.Services.ScriptService]
    public class FeedbackListServices : System.Web.Services.WebService
    {

        [WebMethod]
        public FeedbackList[] GetList(string departmentFilter, string ratingFilter, string approvalFilter)
        {
            DataTable sqlDt = new DataTable("lists");

            string sqlConnectString = System.Configuration.ConfigurationManager.ConnectionStrings["myDB"].ConnectionString;
            string sqlSelect;

            if (departmentFilter =="null")
            {
                if(ratingFilter == "null")
                {
                    sqlSelect = "SELECT * FROM `feedbacklist` WHERE `approval` = @approvalFilter";
                }
                else
                {
                    sqlSelect = "SELECT * FROM `feedbacklist` WHERE `rating` = @ratingFilter AND `approval` = @approvalFilter";
                }
            }
            else if (ratingFilter == "null")
            {
                sqlSelect = "SELECT * FROM `feedbacklist` WHERE `department` = @departmentFilterValue AND `approval` = @approvalFilter";
            }
            else
            {
                sqlSelect = "SELECT * FROM `feedbacklist` WHERE `department` = @departmentFilterValue AND `rating` = @ratingFilter AND `approval` = @approvalFilter";
            }
            

            MySqlConnection sqlConnection = new MySqlConnection(sqlConnectString);
            MySqlCommand sqlCommand = new MySqlCommand(sqlSelect, sqlConnection);

            //tell our command to replace the @parameters with real values
            //we decode them because they came to us via the web so they were encoded
            //for transmission (funky characters escaped, mostly)
            sqlCommand.Parameters.AddWithValue("@departmentFilterValue", HttpUtility.UrlDecode(departmentFilter));
            sqlCommand.Parameters.AddWithValue("@ratingFilter", HttpUtility.UrlDecode(ratingFilter));
            sqlCommand.Parameters.AddWithValue("@approvalFilter", HttpUtility.UrlDecode(approvalFilter));

            //gonna use this to fill a data table
            MySqlDataAdapter sqlDa = new MySqlDataAdapter(sqlCommand);
            //filling the data table
            sqlDa.Fill(sqlDt);

            //loop through each row in the dataset, creating instances
            //of our container class Account.  Fill each acciount with
            //data from the rows, then dump them in a list.
            List<FeedbackList> lists = new List<FeedbackList>();
            for (int i = 0; i < sqlDt.Rows.Count; i++)
            {
                lists.Add(new FeedbackList
                {
                    reviewer = sqlDt.Rows[i]["user"].ToString(),
                    department = sqlDt.Rows[i]["department"].ToString(),
                    rating = Convert.ToInt32(sqlDt.Rows[i]["rating"]),
                    comment = sqlDt.Rows[i]["comment"].ToString(),
                    approval = Convert.ToInt32(sqlDt.Rows[i]["approval"]),
                    feedbackId = Convert.ToInt32(sqlDt.Rows[i]["feedbackListId"]),
                });
            }
            //convert the list of accounts to an array and return!
            return lists.ToArray();
        }
    }
}
