document.addEventListener('DOMContentLoaded', bindAddPersonButton);
//document.addEventListener('DOMContentLoadedHP', bindHomePageButton);
function bindAddPersonButton() {
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
    //sconsole.log(param);
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
        var cId = response.cid;
        var tableId = response.co_name;

        for (var variableName in response) {
          if (variableName == 'id');
          else if(variableName == 'cid');
          else if(variableName == 'co_name');
          else {
            var cell = document.createElement("td");
            cell.id = variableName;
            cell.textContent = response[variableName];
            row.appendChild(cell);
          }
        }
        var deleteRelationshipCell = newDeleteRelationshipCell(id, cId, response['co_name']);
        row.appendChild(deleteRelationshipCell);
        var table = document.getElementById(response['co_name']);
        table.appendChild(row);
      } else {
        console.log('ERROR' + req.statusText);
      }
    });
    req.send("/insertToCompany" + param);
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

function newDeleteRelationshipCell(id,cid, table_id) {
  var deleteRelationshipCell = document.createElement("td");
  var deleteButton = document.createElement('input');
  deleteButton.setAttribute('type', 'button');
  deleteButton.setAttribute('name', 'delete');
  deleteButton.setAttribute('value', 'Delete');
  deleteButton.setAttribute('onClick', 'deleteCoRow(' + id + ', ' + cid + ', "'  + table_id + '")');

  var deleteHidden = document.createElement('input');
  deleteHidden.setAttribute('type', 'hidden');
  deleteHidden.setAttribute('id', id);
  deleteRelationshipCell.appendChild(deleteButton);
  deleteRelationshipCell.appendChild(deleteHidden);

  return deleteRelationshipCell;
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


function deleteCoRow(perId, coId, tableId) {

  var req = new XMLHttpRequest();

  var deleteParam = "/deleteFromCompany?per_id=" + perId + "&co_id=" + coId;
  req.open("GET", deleteParam, true);

  req.addEventListener("load", function() {
    if (req.status >= 200 && req.status < 400) {
      console.log('delete processed');
    } else {
      console.log('there was an error');
    }
  });

  req.send(deleteParam);
  event.preventDefault();
  console.log(tableId);
  var table = document.getElementById(tableId);
  var n = table.rows.length;
  var rowNum;

  for (var i = 1; i < n; i++) {
    var row = table.rows[i];
    var allCells = row.getElementsByTagName("td");
    var dCell = allCells[allCells.length - 1];
    if (dCell.children[1].id === perId) {
      rowNum = i;
    }
  }
  table.deleteRow(rowNum);
}
