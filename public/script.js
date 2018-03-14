document.addEventListener('DOMContentLoaded', bindAddPersonButton);
document.addEventListener('DOMContentLoadedHP', bindHomePageButton);
function bindAddPersonButton() {
  document.querySelector("#addPerson").addEventListener('submit', function(event) {
    event.preventDefault();
  });

  document.getElementById('submitPerson').addEventListener('click', function(event) {
    var name = document.getElementById('name').value;
    if (name == "") {
      alert("Name Cannot Be Empty");
      return;
    }
    var email = document.getElementById('email').value;
    if (email == "") {
      alert("Email Cannot Be Empty");
      return;
    }
    /*var weight = document.getElementById('weight').value;
    var lbsCheck = document.getElementById('lbs');
    var kgCheck = document.getElementById('kg');
    var unit;
    if (lbsCheck.checked) {
      unit = 1;
    } else if (kgCheck.checked) {
      unit = 0;
    }
    var date = document.getElementById('date').value;*/

    var bigLongParam = "?name=" + name + "&email=" + email; // + "&weight=" + weight + "&date=" + date + "&lbs=" + unit;
    console.log(bigLongParam);
    var req = new XMLHttpRequest();
    req.open("GET", "/insertToperson" + bigLongParam, true);
    req.addEventListener('load', function() {
      if (req.status >= 200 && req.status < 400) {
        var response = JSON.parse(req.responseText);
        var row = document.createElement("tr");
        var id = response.id;
        /*var req2 = new XMLHttpRequest();
        req2.open("GET", "/createCompanies" + "?id=" + id, true);
        req2.addEventListener("load", function() {
          if (req.status >= 200 && req.status < 400) {
            console.log('companies created');
          } else {
            console.log('there was an error creating companies');
          }
        });
        req2.send("/createCompanies" + "?id=" + id);
        event.preventDefault();*/
        for (var variableName in response) {
          if (variableName == 'id');
          /*else if (variableName == 'lbs') {
            var cell = document.createElement("td");
            cell.id = variableName;
            if (response[variableName]) {
              cell.textContent = "lbs";
            } else cell.textContent = "kg";
            row.appendChild(cell);
          }*/
          else {
            var cell = document.createElement("td");
            cell.id = variableName;
            cell.textContent = response[variableName];
            row.appendChild(cell);
          }
        }
        var updateCell = newUpdateCell(id);
        row.appendChild(updateCell);
        var deleteCell = newDeleteCell(id);
        row.appendChild(deleteCell);
        var table = document.getElementById('personTable');
        table.appendChild(row);
      } else {
        console.log('ERROR' + req.statusText);
      }
    });
    req.send("/insertToPerson" + bigLongParam);
    event.preventDefault();
  });

}

function bindHomePageButton(){
  document.querySelector("#giveReview").addEventListener('submit', function(event) {
    event.preventDefault();
  });
  document.querySelector("#addToCompany").addEventListener('submit', function(event) {
    event.preventDefault();
  });

  document.getElementById('addPersonToCompany').addEventListener('click', function(event) {
    var addPersonId = document.getElementById('addPerson').value;
    if (addPersonId == "") {
      alert("Name Cannot Be Empty");
      return;
    }
    var addCompanyId= document.getElementById('addCompany').value;
    if (email == "") {
      alert("Email Cannot Be Empty");
      return;
    }
    var param = "?per_id=" + addPersonId + "&co_id=" + addCompanyId; // + "&weight=" + weight + "&date=" + date + "&lbs=" + unit;
    console.log(param);
    var req = new XMLHttpRequest();
    req.open("GET", "/insertToCompany" + param, true);
    req.addEventListener('load', function() {
      if (req.status >= 200 && req.status < 400) {
        var response = JSON.parse(req.responseText);
        if (response[0] == "false"){
          alert("Duplicate value not added");
          return;
        }
        var row = document.createElement("tr");
        var id = response.id;

        for (var variableName in response) {
          if (variableName == 'id');
          /*else if (variableName == 'lbs') {
            var cell = document.createElement("td");
            cell.id = variableName;
            if (response[variableName]) {
              cell.textContent = "lbs";
            } else cell.textContent = "kg";
            row.appendChild(cell);
          }*/
          else {
            var cell = document.createElement("td");
            cell.id = variableName;
            cell.textContent = response[variableName];
            row.appendChild(cell);
          }
        }
        var updateCell = newUpdateCell(id);
        row.appendChild(updateCell);
        var deleteCell = newDeleteCell(id);
        row.appendChild(deleteCell);
        var table = document.getElementById(addCompanyId);
        table.appendChild(row);
      } else {
        console.log('ERROR' + req.statusText);
      }
    });
    req.send("/insertToReviews" + bigLongParam);
    event.preventDefault();
  });
}

function newUpdateCell(id) {
  var updateCell = document.createElement("td");

  var updateUrl = document.createElement('a');
  updateUrl.setAttribute('href', '/update?id=' + id);


  var updateButton = document.createElement('input');
  updateButton.setAttribute('type', 'button');
  updateButton.setAttribute('value', 'Update');

  updateUrl.appendChild(updateButton);
  updateCell.appendChild(updateUrl);

  return updateCell;
}

function newDeleteCell(id) {
  var deleteCell = document.createElement("td");
  var deleteButton = document.createElement('input');
  deleteButton.setAttribute('type', 'button');
  deleteButton.setAttribute('name', 'delete');
  deleteButton.setAttribute('value', 'Delete');
  deleteButton.setAttribute('onClick', 'deleteRow(' + id + ')');

  var deleteHidden = document.createElement('input');
  deleteHidden.setAttribute('type', 'hidden');
  deleteHidden.setAttribute('id', 'd0449210' + id);
  deleteCell.appendChild(deleteButton);
  deleteCell.appendChild(deleteHidden);

  return deleteCell;
}

function newViewSiteAsCell(id){
  var vsaCell = document.createElement("td");

  var vsaUrl = document.createElement('a');
  vsaUrl.setAttribute('href', '/homepage?id=' + id);


  var vsaButton = document.createElement('input');
  vsaButton.setAttribute('type', 'button');
  vsaButton.setAttribute('value', 'Update');

  vsaUrl.appendChild(vsaButton);
  vsaCell.appendChild(vsaUrl);

  return vsaCell;
}


function deleteRow(id) {

  var req = new XMLHttpRequest();

  req.open("GET", "/delete?id=" + id, true);

  req.addEventListener("load", function() {
    if (req.status >= 200 && req.status < 400) {
      console.log('delete processed');
    } else {
      console.log('there was an error');
    }
  });

  req.send("delete/?id=" + id);
  event.preventDefault();

  var dtring = "d0449210" + id;
  var table = document.getElementById('exerciseTable');
  var n = table.rows.length;
  var rowNum;

  for (var i = 1; i < n; i++) {
    var row = table.rows[i];
    var allCells = row.getElementsByTagName("td");
    var dCell = allCells[allCells.length - 1];
    if (dCell.children[1].id === "d0449210" + id) {
      rowNum = i;
    }
  }
  table.deleteRow(rowNum);
}

function vsa(id){

}
/**/
