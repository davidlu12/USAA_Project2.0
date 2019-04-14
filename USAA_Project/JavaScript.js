//we're using a stacked card approach for our main viewing area
//this array holds the ids of our cards and the method
//allows us to easly switch the interface from one to the other
var contentPanels = ['logonPanel', 'departmentsPanel', 'questionsPanel', 'feedbackListPanel', 'thankYouPanel'];
//this function toggles which panel is showing, and also clears data from all panels
function showPanel(panelId) {
    //clearData();
    for (var i = 0; i < contentPanels.length; i++) {
        if (panelId === contentPanels[i]) {
            $("#" + contentPanels[i]).css("visibility", "visible");
        }
        else {
            $("#" + contentPanels[i]).css("visibility", "hidden");
        }
    }
}

//this function clears data from all panels
function clearData() {
    clearLogon();
}

//HERE'S AN EXAMPLE OF AN AJAX CALL WITH JQUERY!
function LogOn(userId, pass) {
    var webMethod = "AccountServices.asmx/LogOn";
    var parameters = "{\"uid\":\"" + encodeURI(userId) + "\",\"pass\":\"" + encodeURI(pass) + "\"}";

    //jQuery ajax method
    $.ajax({
        type: "POST",
        url: webMethod,
        data: parameters,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            if (msg.d) {
                //server replied true, so show the departments panel
                //showPanel("departmentsPanel");
                LoadAccounts();
                $(".menu").show();
            }
            else {
                alert("Login Fail");
            }
        },
        error: function (e) {
            alert("boo...");
        }
    });
}

//List all accounts for admins to view
var accountsArray;
//to begin with, we assume that the account is not an admin
var admin = false;
var loggedInUser;

//this function grabs accounts and loads our account window
function LoadAccounts() {
    var webMethod = "AccountServices.asmx/GetAccounts";
    $.ajax({
        type: "POST",
        url: webMethod,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            if (msg.d.length > 0) {
                //let's put our accounts that we get from the
                //server into our accountsArray variable
                //so we can use them in other functions as well
                accountsArray = msg.d;
                //again, we assume we're not an admin unless we see data from the server
                //that we know only admins can see
                admin = false;
                loggedInUser = accountsArray[0].firstName +" "+ accountsArray[0].lastName;
                for (var i = 0; i < accountsArray.length; i++) {
                    //we grab on to a specific html element in jQuery
                    //by using a  # followed by that element's id.
                    //var acct;
                    //if they have access to admin-level info (like userid and password) then
                    //create output that has an edit option
                    if (accountsArray[i].userId !== null) {
                        admin = true;
                        showPanel('feedbackListPanel');
                        filterReset();
                    }
                    //if not, then they're not an admin so don't include the edit option
                    else {
                        /*acct = "<div class='accountRow' id='acct" + accountsArray[i].id + "'>" +
                            "<a class='nameTag' href='mailto:" + accountsArray[i].email + "'>" +
                            accountsArray[i].firstName + " " + accountsArray[i].lastName +
                            "</a></div><hr>"*/
                        showPanel('departmentsPanel');
                        LoadList();
                      
                    }

                }
            }
        },
        error: function (e) {
            alert("boo...");
        }
    });
}

//resets the logon inputs
function clearLogon() {
    $('#logonId').val("");
    $('#logonPassword').val("");
    $(".menu").hide();
}

//logs the user off both at the client and at the server
function LogOff() {

    var webMethod = "AccountServices.asmx/LogOff";
    $.ajax({
        type: "POST",
        url: webMethod,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            if (msg.d) {
                //we logged off, so go back to logon page,
                //stop checking messages
                //and clear the chat panel
                showPanel('logonPanel');
                clearLogon();
            }
        },
        error: function (e) {
            alert("boo...");
        }
    });
}

//this function executes once jQuery has successfully loaded and is
//ready for business.  Usually, if we're wiring up event handlers via jQuery
//then this is where they go.
jQuery(function () {
    //when the app loads, show the logon panel to start with!
    showPanel('logonPanel');
    clearLogon();
});



// -------------------------------------------------------------------------------------------------------------------------------------------------
// Functions for feedBackListPage below -------------------------------------------------------------------------------------------------------------------------------------------------------------------------
$('input[type="checkbox"]').on('change', function () {
    $('input[name="' + this.name + '"]').not(this).prop('checked', false);
});
var listsArray;

//this function grabs lists and loads our list window
function LoadList() {
    var webMethod = "FeedbackListServices.asmx/GetList";
    var parameters = "{\"departmentFilter\":\"" + encodeURI(departmentFilter) + "\",\"ratingFilter\":\"" + encodeURI(ratingFilter) + "\",\"approvalFilter\":\"" + encodeURI(approvalFilter) + "\"}";
    $.ajax({
        type: "POST",
        url: webMethod,
        data: parameters,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            if (msg.d.length > 0) {
                //let's put our accounts that we get from the
                //server into our accountsArray variable
                //so we can use them in other functions as well
                listsArray = msg.d;
                //this clears out the div that will hold our account info

                $("#feedbackListItemBox").empty();
                $("#feedbackListItemBox").append("<thead><tr class='dbListTitle '>" +
                    "<th>Reviewer</th>" +
                    "<th>Department</th>" +
                    "<th>Questions</th>" +
                    "<th>Rating</th>" +
                    "<th>Comment</th>" +
                    "<th>Approval</th>" +
                    "<th><button onclick='myFunction()'>Print...</button></th></tr></thead>"
                );
                for (var i = 0; i < listsArray.length; i++) {
                    //we grab on to a specific html element in jQuery
                    //by using a  # followed by that element's id.
                    var acct;
                    acct = "<tbody><tr>" + "<td>" + listsArray[i].reviewer + "</td>" +
                        "<td>" + listsArray[i].department + "</td>" +
                        "<td>" + listsArray[i].question +"</td>"+
                        "<td>" + listsArray[i].rating + "</td>" +
                        "<td>" + listsArray[i].comment + "</td>";

                    var acctUserHidden;
                    acctUserHidden = "<tbody><tr>" + "<td> ****** </td>" +
                        "<td>" + listsArray[i].department + "</td>" +
                        "<td>" + listsArray[i].question + "</td>"+
                        "<td>" + listsArray[i].rating + "</td>" +
                        "<td>" + listsArray[i].comment + "</td>";

                    var approvalChecked;
                    approvalChecked = "<td>" + "<button onclick='EditFeedback(" + listsArray[i].feedbackId + ")' disabled>Approved</button>" + "</td>" + "</tr></tbody>"
                    var approvalNotChecked;
                    approvalNotChecked = "<td>" + "<button id='approvedbutton' onclick='EditFeedback(" + listsArray[i].feedbackId + ")' >Click to Approve</button>" + "</td>" + "</tr></tbody>"


                    if (reviewerFilter === 1) {
                        if (listsArray[i].approval === 1) {
                            $("#feedbackListItemBox").append(
                                //anything we throw at our panel in the form of text
                                //will be added to the contents of that panel.  Here
                                acctUserHidden + approvalChecked
                            );
                        }
                        else {
                            $("#feedbackListItemBox").append(
                                //anything we throw at our panel in the form of text
                                //will be added to the contents of that panel.  Here
                                acctUserHidden + approvalNotChecked
                            );
                        }
                    } else if (listsArray[i].approval === 1) {
                        $("#feedbackListItemBox").append(
                            //anything we throw at our panel in the form of text
                            //will be added to the contents of that panel.  Here
                            acct + approvalChecked
                        );
                    }
                    else {
                        $("#feedbackListItemBox").append(
                            //anything we throw at our panel in the form of text
                            //will be added to the contents of that panel.  Here
                            acct + approvalNotChecked
                        );
                    }


                }
            }
            //we're showing the account window, so let's track that...
            accountWindowShowing = true;
            //...because the ShowMenu function behaves differently depending on
            //if the account window is showing or not
            //ShowMenu();
        },
        error: function (e) {
            alert("boo...");
        }
    });
}

//ajax to send the edits of an item to the server -------------------------------------------------------------------------------------------------------------------------
function EditFeedback(feedbackId) {
    var webMethod = "FeedbackListServices.asmx/ApproveFeedback";
    var parameters = "{\"id\":\"" + encodeURI(feedbackId) + "\",\"approval\":\"" + "1" + "\"}";

    $.ajax({
        type: "POST",
        url: webMethod,
        data: parameters,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            //showPanel('listPanel');
            LoadList();
        },
        error: function (e) {
            alert("boo...");
        }
    });
}

// Print screen function -------------------------------------------------------------------------------------------------------------------------------------------
function myFunction() {
    window.print();
}

// Filter functions ------------------------------------------------------------------------------------------------------------------------------------------------
var reviewerFilter;
var departmentFilter;
var ratingFilter;
var approvalFilter;

function hideReviewer() {
    document.getElementById("hideReviewerCB").checked = true;
    document.getElementById("unhideCB").checked = false;
    reviewerFilter = 1;
    LoadList();
}
function unhideReviewer() {
    document.getElementById("hideReviewerCB").checked = false;
    document.getElementById("unhideCB").checked = true;
    reviewerFilter = 0;
    LoadList();
}
function accountingFilter() {
    document.getElementById("accountingCB").checked = true;
    document.getElementById("iTCB").checked = false;
    departmentFilter = "Accounting";
    LoadList();
}
function ITFilter() {
    document.getElementById("accountingCB").checked = false;
    document.getElementById("iTCB").checked = true;
    departmentFilter = "IT";
    LoadList();
}
function rating1Filter() {
    document.getElementById("1CB").checked = true;
    document.getElementById("2CB").checked = false;
    document.getElementById("3CB").checked = false;
    document.getElementById("4CB").checked = false;
    ratingFilter = 1;
    LoadList();
}
function rating2Filter() {
    document.getElementById("1CB").checked = false;
    document.getElementById("2CB").checked = true;
    document.getElementById("3CB").checked = false;
    document.getElementById("4CB").checked = false;
    ratingFilter = 2;
    LoadList();
}
function rating3Filter() {
    document.getElementById("1CB").checked = false;
    document.getElementById("2CB").checked = false;
    document.getElementById("3CB").checked = true;
    document.getElementById("4CB").checked = false;
    ratingFilter = 3;
    LoadList();
}
function rating4Filter() {
    document.getElementById("1CB").checked = false;
    document.getElementById("2CB").checked = false;
    document.getElementById("3CB").checked = false;
    document.getElementById("4CB").checked = true;
    ratingFilter = 4;
    LoadList();
}
function approvedFilter() {
    document.getElementById("approvedCB").checked = true;
    document.getElementById("notApprovedCB").checked = false;
    approvalFilter = 1;
    LoadList();
}
function notApprovedFilter() {
    document.getElementById("approvedCB").checked = false;
    document.getElementById("notApprovedCB").checked = true;
    approvalFilter = 0;
    LoadList();
}
function filterReset() {
    document.getElementById("1CB").checked = false;
    document.getElementById("2CB").checked = false;
    document.getElementById("3CB").checked = false;
    document.getElementById("4CB").checked = false;
    document.getElementById("hideReviewerCB").checked = true;
    document.getElementById("unhideCB").checked = false;
    document.getElementById("accountingCB").checked = false;
    document.getElementById("iTCB").checked = false;
    document.getElementById("approvedCB").checked = false;
    document.getElementById("notApprovedCB").checked = true;
    reviewerFilter = 1;
    departmentFilter = "null";
    ratingFilter = "null";
    approvalFilter = 0;
    LoadList();
}

//Department page functions --------------------------------------------------------------------------------------
var department;
function ITQuestionsPage() {
    showPanel('questionsPanel'); 
    loadQuestions();
    department = "IT";
}

// Thank you page functions ---------------------------------------------------------------------------------------

function BackToDepartments() {
    showPanel('departmentsPanel');
}

function ToThankYouPage() {
    showPanel('thankYouPanel');
}

// Questions Page ------------------------------------------------------------------------------------------------
var name = "Hailee Copter";

var questionsArray;
var feedbackArray = [];// Feedback Array. user, department, question, inputType, approval

function loadQuestions() {
    var webMethod = "../QuestionsService.asmx/GetQuestions";
    $.ajax({
        type: "POST",
        url: webMethod,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            if (msg.d.length > 0) {
                questionsArray = msg.d;

                for (var i = 0; i < questionsArray.length; i++) {
                    if (questionsArray[i].DepartmentName === department) {
                        $("#questionBox").append("<tr>" +
                            "<td>" + questionsArray[i].Question + "</td>" +
                            "</tr>");

                        var ratingInput = document.createElement('input');
                        var textboxInput = document.createElement('input');
                        //var saveButton = document.createElement('input');

                        $("#questionBox").append("<tr>"); // for rating

                        for (var j = 0; j < 4; j++) {
                            ratingInput = document.createElement('input');
                            ratingInput.type = "radio";
                            ratingInput.id = j + questionsArray[i].Question;
                            ratingInput.class = "answer";
                            ratingInput.name = "test" + i;
                            ratingInput.value = j + 1;
                            $("#questionBox").append("<tr>" + "<td>", ratingInput, ratingInput.value, "</td>" + "</tr>");
                            feedbackArray.push([questionsArray[i].Question, ratingInput]);
                        }
                        $("#questionBox").append("</tr>");

                        textboxInput.type = "text"; // for textbox
                        textboxInput.id = i;
                        textboxInput.class = "answer";
                        $("#questionBox").append("<tr>" + "<td>", textboxInput, "</td>" + "</tr>");
                        feedbackArray.push([questionsArray[i].Question, textboxInput]);

                        //saveButton.type = "Button"; // for save button
                        //saveButton.value = "Save";
                        //$("#questionBox").append("<tr>" + "<td", saveButton, "</td>" + "</tr>");
                    }
                }
            }
            accountWindowShowing = true;
        },
        error: function (e) {
            alert("boo...");
        }
    });
}

var questionDB;
var radioValueDB;
var commentDb;
var userName;
var departmentDB;

function storeFeedback() {

    var feedbackListArray = [];
    var currentQuestion, radioValue, textValue;

    for (var i = 0; i < feedbackArray.length; i++) {
        currentQuestion = feedbackArray[i][0];
        if (feedbackArray[i][1].type === 'radio' && feedbackArray[i][1].checked === true) {
            radioValue = feedbackArray[i][1].value;
        }
        else if (feedbackArray[i][1].type === 'text') {
            textValue = feedbackArray[i][1].value;
            feedbackListArray.push(["", name, department, currentQuestion, radioValue, textValue]);
        }
    }
    console.log(feedbackListArray);

    for (var k = 0; k < feedbackListArray.length; k++) {
        questionDB = feedbackListArray[k][3];
        radioValueDB = feedbackListArray[k][4];
        commentDb = feedbackListArray[k][5];
        userName = loggedInUser;
        departmentDB = feedbackListArray[k][2];
        console.log(questionDB);
        console.log(radioValueDB);
        console.log(commentDb);
        console.log(departmentDB);
        submitFeedbackToDb(userName, departmentDB, questionDB, radioValueDB, commentDb);
    }
    ToThankYouPage();
}

function submitFeedbackToDb(userName, department, questionDB, radioValueDB, commentDb) {
    var webMethod = "../QuestionsService.asmx/AddResponseToList";
    var parameters = "{\"name\":\"" + encodeURI(userName) + "\",\"department\":\"" + encodeURI(department) + "\",\"question\":\"" + encodeURI(questionDB) + "\",\"rating\":\"" + encodeURI(radioValueDB) +
        "\",\"comment\":\"" + encodeURI(commentDb) + "\"}";


    $.ajax({
        type: "POST",
        url: webMethod,
        data: parameters,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
        },
        error: function (e) {
            alert("boo...");
        }
    });
};
