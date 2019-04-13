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
    /// Summary description for QuestionsService
    /// </summary>
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    // To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
    [System.Web.Script.Services.ScriptService]
    public class QuestionsService : System.Web.Services.WebService
    {

        [WebMethod]
        public Questions[] GetQuestions()
        {
            DataTable sqlDt = new DataTable("questions");

            string sqlConnectString = System.Configuration.ConfigurationManager.ConnectionStrings["myDB"].ConnectionString;
            string sqlSelect = "select * from question";

            MySqlConnection sqlConnection = new MySqlConnection(sqlConnectString);
            MySqlCommand sqlCommand = new MySqlCommand(sqlSelect, sqlConnection);

            //gonna use this to fill a data table
            MySqlDataAdapter sqlDa = new MySqlDataAdapter(sqlCommand);
            //filling the data table
            sqlDa.Fill(sqlDt);

            //loop through each row in the dataset, creating instances
            //of our container class Account.  Fill each acciount with
            //data from the rows, then dump them in a list.
            List<Questions> questions = new List<Questions>();
            for (int i = 0; i < sqlDt.Rows.Count; i++)
            {
                questions.Add(new Questions
                { //cs = blablabla["databaseColumn"].blablabla
                    QuestionID = Convert.ToInt32(sqlDt.Rows[i]["QuestionID"]),
                    Question = sqlDt.Rows[i]["Question"].ToString(),
                    QuestionType = sqlDt.Rows[i]["QuestionType"].ToString(),
                    DepartmentName = sqlDt.Rows[i]["DepartmentName"].ToString(),    
                });
            }
            //convert the list of accounts to an array and return!
            return questions.ToArray();
        }

        [WebMethod(EnableSession = true)]
        public void AddResponseToList(string name, string department, string question, string rating, string comment){
            string sqlConnectString = System.Configuration.ConfigurationManager.ConnectionStrings["myDB"].ConnectionString;
            //the only thing fancy about this query is SELECT LAST_INSERT_ID() at the end.  All that
            //does is tell mySql server to return the primary key of the last inserted row.
            string sqlSelect = "insert into feedbacklist (user, department, rating, comment, approval) " +
                "values(@listvalue,@departmentvalue, @ratingvalue, @commentvalue, 0);";

            MySqlConnection sqlConnection = new MySqlConnection(sqlConnectString);
            MySqlCommand sqlCommand = new MySqlCommand(sqlSelect, sqlConnection);

            sqlCommand.Parameters.AddWithValue("@uservalue", HttpUtility.UrlDecode(name));
            sqlCommand.Parameters.AddWithValue("@departmentvalue", HttpUtility.UrlDecode(department));
            sqlCommand.Parameters.AddWithValue("@ratingvalue", HttpUtility.UrlDecode(rating));
            sqlCommand.Parameters.AddWithValue("@commentvalue", HttpUtility.UrlDecode(comment));
            //this time, we're not using a data adapter to fill a data table.  We're just
            //opening the connection, telling our command to "executescalar" which says basically
            //execute the query and just hand me back the number the query returns (the ID, remember?).
            //don't forget to close the connection!
            sqlConnection.Open();
            //we're using a try/catch so that if the query errors out we can handle it gracefully
            //by closing the connection and moving on

            try
            {
                int accountID = Convert.ToInt32(sqlCommand.ExecuteScalar());
                //here, you could use this accountID for additional queries regarding
                //the requested account.  Really this is just an example to show you
                //a query where you get the primary key of the inserted row back from
                //the database!

            }
            catch (Exception e)
            {
            }
            sqlConnection.Close();
        }

    }
}
