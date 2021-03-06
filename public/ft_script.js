document.addEventListener('DOMContentLoaded', bindAddPersonButton);
//document.addEventListener('DOMContentLoadedHP', bindHomePageButton);
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
    var bigLongParam = "?name=" + name + "&email=" + email; // + "&weight=" + weight + "&date=" + date + "&lbs=" + unit;
    console.log(bigLongParam);
    var req = new XMLHttpRequest();
    req.open("GET", "/insertToperson" + bigLongParam, true);
    req.addEventListener('load', function() {
      if (req.status >= 200 && req.status < 400) {
        var response = JSON.parse(req.responseText);
        var row = document.createElement("tr");
        var id = response.id;

        for (var variableName in response) {
          if (variableName == 'id');
          else {
            var cell = document.createElement("td");
            cell.id = variableName;
            cell.textContent = response[variableName];
            row.appendChild(cell);
          }
        }
        var deleteCell = newDeleteCell(id);
        row.appendChild(deleteCell);
        var vsaCell = newViewSiteAsCell(id, response['name']);
        row.appendChild(vsaCell);
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
  deleteHidden.setAttribute('id', id);
  deleteCell.appendChild(deleteButton);
  deleteCell.appendChild(deleteHidden);

  return deleteCell;
}

function newViewSiteAsCell(id, name){
  var vsaCell = document.createElement("td");

  var vsaUrl = document.createElement('a');
  vsaUrl.setAttribute('href', '/homepage?id=' + id);


  var vsaButton = document.createElement('input');
  vsaButton.setAttribute('type', 'button');
  vsaButton.setAttribute('value', name);

  vsaUrl.appendChild(vsaButton);
  vsaCell.appendChild(vsaUrl);

  return vsaCell;
}


function deleteRow(id) {

  var req = new XMLHttpRequest();

  req.open("GET", "/deleteAllButPerson?id=" + id, true);

  req.addEventListener("load", function(event) {
    event.preventDefault();
    if (req.status >= 200 && req.status < 400) {
      console.log('delete processed');
    } else {
      console.log('there was an error');
    }
  });

  req.send("/deleteAllButPerson?id=" + id);

  var req2 = new XMLHttpRequest();
  req2.open("GET", "/deletePerson?id="+id, true);
  req2.addEventListener("load", function(event) {
    event.preventDefault();
    if (req2.status >= 200 && req2.status < 400) {
      console.log('delete processed');
    } else {
      console.log('there was an error');
    }
  });
  req2.send("/deletePerson?id="+id);

  var table = document.getElementById('personTable');
  var n = table.rows.length;
  var rowNum;

  for (var i = 1; i < n; i++) {
    var row = table.rows[i];
    var allCells = row.getElementsByTagName("td");
    var dCell = allCells[allCells.length - 2];
    if (dCell.children[1].id ==id) {
      rowNum = i;
    }
  }
  table.deleteRow(rowNum);

  /*req.open("GET", "/deletePerson?id=" + id, true);

  req.addEventListener("load", function(event) {
    event.preventDefault();
    if (req.status >= 200 && req.status < 400) {
      console.log('delete processed');
    } else {
      console.log('there was an error');
    }
  });

  req.send("/deletePerson?id=" + id);*/
}

function deletePerson(id){


}
/**/
