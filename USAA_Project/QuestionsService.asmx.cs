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
                    QuestionType = sqlDt.Rows[i]["Rating"].ToString(),
                    DepartmentName = sqlDt.Rows[i]["DepartmentName"].ToString(),
                });
            }
            //convert the list of accounts to an array and return!
            return questions.ToArray();
        }
    }
}
