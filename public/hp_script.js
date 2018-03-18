document.addEventListener('DOMContentLoaded', bindAddPersonButton);

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
    var addCompanyId = document.getElementById('addCompany').value;

    var param = "?per_id=" + addPersonId + "&co_id=" + addCompanyId; // + "&weight=" + weight + "&date=" + date + "&lbs=" + unit;
    console.log(param);

    var req = new XMLHttpRequest();
    req.open("GET", "/insertToCompany" + param, true);
    req.addEventListener('load', function() {
      if (req.status >= 200 && req.status < 400) {
        var response = JSON.parse(req.responseText);
        if (response[0] == "false") {
          alert("Duplicate value not added");
          return;
        }
        var row = document.createElement("tr");
        var id = response.id;
        var cId = response.cid;
        var tableId = response.co_name;

        for (var variableName in response) {
          if (variableName == 'id');
          else if (variableName == 'cid');
          else if (variableName == 'co_name');
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

  document.querySelector("#giveReview").addEventListener('submit', function(event) {
    event.preventDefault();
  });

  document.getElementById('addToReviews').addEventListener('click', function(event) {
    var bothIds = document.getElementById('reviewPerson').value;
    var idArray = bothIds.split(",", 2);

    var btId = idArray[0];
    var gbId = idArray[1];
    if (btId == "") {
      alert("Name Cannot Be Empty");
      return;
    }

    var oneStar = document.getElementById('star-1');
    var twoStar = document.getElementById('star-2');
    var threeStar = document.getElementById('star-3');
    var fourStar = document.getElementById('star-4');
    var fiveStar = document.getElementById('star-5');
    var numStars;
    if (oneStar.checked) {
      numStars = 1;
    } else if (twoStar.checked) {
      numStars = 2;
    } else if (threeStar.checked) {
      numStars = 3;
    } else if (fourStar.checked) {
      numStars = 4;
    } else if (fiveStar.checked) {
      numStars = 5;
    } else {
      alert("Reviews must contain star rating of at least 1");
      return;
    }
    var classifier = document.getElementById('classifier').value;
    if (classifier == "") {
      alert("Classifier Cannot Be Empty");
      return;
    }


    var param = "?bt_id=" + btId + "&gb_id=" + gbId + "&rating=" + numStars + "&term=" + classifier; // + "&weight=" + weight + "&date=" + date + "&lbs=" + unit;
    console.log(param);
    var req1 = new XMLHttpRequest();
    req1.open("GET", "/insertToReviews" + param, true);
    req1.addEventListener('load', function() {
      if (req1.status >= 200 && req1.status < 400) {
        var response = JSON.parse(req.responseText);
        if (response[0] == "false") {
          alert("Cannot review same person twice");
          return;
        }

        var btId = response.belongs_to_id;
        var gbId = response.given_by_id;
        var rating = response.avg_rating;
        //remove option
        var findString = btId + "," + gbId;
        var selectobject = document.getElementById("reviewPerson")
        for (var i = 0; i < selectobject.length; i++) {
          if (selectobject.options[i].value == findString) {
            selectobject.remove(i);
          }
        }

        // update company tables
        var table = document.getElementById("Family");
        var n = table.rows.length;
        var rowNum;
        //add cell to row
        for (var i = 1; i < n; i++) {
          var urow = table.rows[i];
          var allCells = urow.getElementsByTagName("td");
          var dCell = allCells[allCells.length - 1];
          //console.log(dCell.children[1].id)
          //console.log(perId);
          if (dCell.children[1].id == btId) {
            rowNum = i;
            //console.log(rowNum);
            //update rating
            var x = document.getElementById("Family").rows[rowNum].cells;
            x[1].innerHTML = rating;
          }
        }


        var table = document.getElementById("Friends");
        var n = table.rows.length;
        var rowNum;
        //add cell to row
        for (var i = 1; i < n; i++) {
          var urow = table.rows[i];
          var allCells = urow.getElementsByTagName("td");
          var dCell = allCells[allCells.length - 1];
          //console.log(dCell.children[1].id)
          //console.log(perId);
          if (dCell.children[1].id == btId) {
            rowNum = i;
            //console.log(rowNum);
            //update rating
            var x = document.getElementById("Friends").rows[rowNum].cells;
            x[1].innerHTML = rating;
          }
        }


        var table = document.getElementById("Work");
        var n = table.rows.length;
        var rowNum;
        //add cell to row
        for (var i = 1; i < n; i++) {
          var urow = table.rows[i];
          var allCells = urow.getElementsByTagName("td");
          var dCell = allCells[allCells.length - 1];
          //console.log(dCell.children[1].id)
          //console.log(perId);
          if (dCell.children[1].id == btId) {
            rowNum = i;
            //console.log(rowNum);
            //update rating
            var x = document.getElementById("Work").rows[rowNum].cells;
            x[1].innerHTML = rating;
          }
        }

        var row = document.createElement("tr");
        for (var variableName in response) {
          if (variableName == 'belongs_to_id');
          else if (variableName === 'given_by_id');
          else if (variableName === 'avg_rating');
          else {
            var cell = document.createElement("td");
            cell.id = variableName;
            cell.textContent = response[variableName];
            row.appendChild(cell);
          }
        }
        var deleteReviewCell = newDeleteReviewCell(btId, gbId);
        row.appendChild(deleteReviewCell);
        var table = document.getElementById("ReviewsG");
        table.appendChild(row);
      } else {
        console.log('ERROR' + req.statusText);
      }
    });
    req1.send("/insertToReviews" + param);
    event.preventDefault;

    //open a new request to delete from has higher status
    var req2 = new XMLHttpRequest();
    var deleteParam = "/deleteFromHHS?bt_id=" + btId + "&gb_id=" + gbId;
    req2.open("GET", deleteParam, true);
    req2.addEventListener("load", function() {
      if (req2.status >= 200 && req2.status < 400) {
        console.log('Higher status tables deleted');
      } else {
        console.log('Error deleting from HHS');
      }
    });
    req2.send(deleteParam);
    event.preventDefault();


    //update has higher status tables
    var req3 = new XMLHttpRequest();
    var updateParam = "/updateHHS?bt_id=" + btId + "&gb_id=" + gbId;
    req3.open("GET", deleteParam, true);
    req3.addEventListener("load", function() {
      if (req3.status >= 200 && req3.status < 400) {
        console.log('Update performed for HHS');
      } else {
        console.log('Error updating HHS');
      }
    });
    req3.send(updateParam);
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

function newDeleteRelationshipCell(id, cid, table_id) {
  var deleteRelationshipCell = document.createElement("td");
  var deleteButton = document.createElement('input');
  deleteButton.setAttribute('type', 'button');
  deleteButton.setAttribute('name', 'delete');
  deleteButton.setAttribute('value', 'Delete');
  deleteButton.setAttribute('onClick', 'deleteCoRow(' + id + ', ' + cid + ', "' + table_id + '")');

  var deleteHidden = document.createElement('input');
  deleteHidden.setAttribute('type', 'hidden');
  deleteHidden.setAttribute('id', id);
  deleteRelationshipCell.appendChild(deleteButton);
  deleteRelationshipCell.appendChild(deleteHidden);

  return deleteRelationshipCell;
}


function lb(id) {
  var ur = "http://flip3.engr.oregonstate.edu:62521/ranking?id=" + id;
  location.reload();
  var myWindow = window.open(ur, "MsgWindow", "width=200,height=100");
}


function newDeleteReviewCell(btId, gbId) {
  var deleteReviewCell = document.createElement("td");
  var deleteButton = document.createElement('input');
  deleteButton.setAttribute('type', 'button');
  deleteButton.setAttribute('name', 'delete');
  deleteButton.setAttribute('value', 'Delete');
  deleteButton.setAttribute('onClick', 'deleteRevRow(' + btId + ", " + gbId + ')');

  var deleteHidden = document.createElement('input');
  deleteHidden.setAttribute('type', 'hidden');
  deleteHidden.setAttribute('id', btId + "_" + gbId);
  deleteReviewCell.appendChild(deleteButton);
  deleteReviewCell.appendChild(deleteHidden);

  return deleteReviewCell;
}

function newViewSiteAsCell(id) {
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
  console.log(deleteParam);
  req.addEventListener("load", function(event) {
    event.preventDefault();
    if (req.status >= 200 && req.status < 400) {} else {
      console.log('there was an error');
    }
  });
  req.send(deleteParam);


  //event.preventDefault();
  //console.log(tableId);
  var table = document.getElementById(tableId);
  var n = table.rows.length;
  var rowNum;

  for (var i = 1; i < n; i++) {
    var row = table.rows[i];
    var allCells = row.getElementsByTagName("td");
    var dCell = allCells[allCells.length - 1];
    //console.log(dCell.children[1].id)
    //console.log(perId);
    if (dCell.children[1].id == perId) {
      rowNum = i;
      //console.log(rowNum);
    }
  }
  table.deleteRow(rowNum);
}

function deleteRevRow(btId, gbId) {

  var req = new XMLHttpRequest();

  var deleteParam = "/deleteFromReviews?bt_id=" + btId + "&gb_id=" + gbId;
  req.open("GET", deleteParam, true);
  req.addEventListener("load", function(event) {
    event.preventDefault();
    if (req.status >= 200 && req.status < 400) {
      console.log('Review Deleted');
    } else {
      console.log('Error deleting review');
    }
  });
  req.send(deleteParam);

  var req2 = new XMLHttpRequest();
  req2.open("GET", "/updateAfterReview?bt_id=" + btId + "&gb_id=" + gbId, true);
  req2.addEventListener("load", function(event) {
    event.preventDefault();
    if (req2.status >= 200 && req2.status < 400) {
      console.log('update_occured');
    } else {
      console.log('there was an error');
    }
  });
  req2.send("/updateAfterReview?bt_id=" + btId + "&gb_id=" + gbId);
  //event.preventDefault();
  //console.log(tableId);

  //delete from table
  var table = document.getElementById("ReviewsG");
  var n = table.rows.length;
  var rowNum;

  for (var i = 1; i < n; i++) {
    var row = table.rows[i];
    var allCells = row.getElementsByTagName("td");
    var dCell = allCells[allCells.length - 1];
    //console.log(dCell.children[1].id)
    //console.log(perId);
    if (dCell.children[1].id == btId + "_" + gbId) {
      rowNum = i;
      //console.log(rowNum);
    }
  }
  table.deleteRow(rowNum);

  //open a new request to delete from has higher status
  var req = new XMLHttpRequest();
  var deleteParam = "/deleteFromHHS?bt_id=" + btId + "&gb_id=" + gbId;
  req.open("GET", deleteParam, true);
  req.addEventListener("load", function(event) {
    event.preventDefault();
    if (req.status >= 200 && req.status < 400) {
      console.log('Higher status tables deleted');
    } else {
      console.log('Error deleting from HHS');
    }
  });
  req.send(deleteParam);


  //update has higher status tables
  var req = new XMLHttpRequest();
  var updateParam = "/updateHHS?bt_id=" + btId + "&gb_id=" + gbId;
  req.open("GET", deleteParam, true);
  req.addEventListener("load", function(event) {
    event.preventDefault();
    if (req.status >= 200 && req.status < 400) {
      console.log('Update performed for HHS');
    } else {
      console.log('Error updating HHS');
    }
  });
  req.send(updateParam);

  location.reload();
}
