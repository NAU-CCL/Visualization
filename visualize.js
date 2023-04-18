function Visualize() {
  var states = new Array();
  var statesmap = new Map();
  var div = document.getElementById('myequations');

  const formElement = document.querySelector('#equations');


  if (formElement == null) {
    alert("Form not found");
    return;
  }
  // initialize 
  var namespace = joint.shapes;

  var graph = new joint.dia.Graph({}, { cellNamespace: namespace });

  var paper = new joint.dia.Paper({
    el: document.getElementById('myholder'),
    model: graph,
    gridSize: 10,
    cellViewNamespace: namespace
  });

  const colors = ["red", "blue", "green", "purple", "orange", "darkblue", "pink"]

  // functions  

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function CreateStates(states) {
    let x = 1, y = 1, counter = 1;

    states.forEach(function (value) {
      let a = getRandomInt(6);
      if (counter % 2 == 0) {
        x = 100;
        y += 100;
      } else {
        x += 100;
      }


      var cir = new joint.shapes.standard.Circle();
      cir.position(x, y);
      cir.resize(100, 40);
      cir.attr({
        body: {
          fill: colors[a]
        },
        label: {
          text: value,
          fill: 'white'
        }
      });
      cir.addTo(graph);      
      counter++;
      statesmap.set(value,cir);
    });
  }

  function CreateLink(from, to, rate) {
    var link = new joint.shapes.standard.Link();
    link.source(from);
    link.target(to);

    link.appendLabel({
      attrs: {
        text: {
          text: rate
        }
      }
    });
  

    link.addTo(graph);
  }
  
  function CreateEquations(from, to, rate) {
    div.innerHTML += from + "->" + to + "," + rate + "<br />";
  }

  // displaying multiple links between two elements in different paths
  function adjustVertices(graph, cell) {
    // If the cell is a view, find its model.
    cell = cell.model || cell;
    if (cell instanceof joint.dia.Element) {
      _.chain(graph.getConnectedLinks(cell)).groupBy(function (link) {
        // the key of the group is the model id of the link's source or target, but not our cell id.
        return _.omit([link.get('source').id, link.get('target').id], cell.id)[0];
      }).each(function (group, key) {
        // If the member of the group has both source and target model adjust vertices.
        if (key !== 'undefined') adjustVertices(graph, _.first(group));
      });
      return;
    }

    // The cell is a link. Let's find its source and target models.
    var srcId = cell.get('source').id || cell.previous('source').id;
    var trgId = cell.get('target').id || cell.previous('target').id;

    // If one of the ends is not a model, the link has no siblings.
    if (!srcId || !trgId) return;

    var siblings = _.filter(graph.getLinks(), function (sibling) {

      var _srcId = sibling.get('source').id;
      var _trgId = sibling.get('target').id;

      return (_srcId === srcId && _trgId === trgId) || (_srcId === trgId && _trgId === srcId);
    });

    switch (siblings.length) {

      case 0:
        // The link was removed and had no siblings.
        break;

      case 1:
        // There is only one link between the source and target. No vertices needed.
        cell.unset('vertices');
        break;

      default:

        // There is more than one siblings. We need to create vertices.
        // First of all we'll find the middle point of the link.
        var srcCenter = graph.getCell(srcId).getBBox().center();
        var trgCenter = graph.getCell(trgId).getBBox().center();
        var midPoint = joint.g.line(srcCenter, trgCenter).midpoint();

        // Then find the angle it forms.
        var theta = srcCenter.theta(trgCenter);

        // This is the maximum distance between links
        var gap = 20;

        _.each(siblings, function (sibling, index) {
          // We want the offset values to be calculated as follows 0, 20, 20, 40, 40, 60, 60 ..
          var offset = gap * Math.ceil(index / 2);
          // Now we need the vertices to be placed at points which are 'offset' pixels distant
          // from the first link and forms a perpendicular angle to it. And as index goes up
          // alternate left and right.
          //
          //  ^  odd indexes
          //  |
          //  |---->  index 0 line (straight line between a source center and a target center.
          //  |
          //  v  even indexes
          var sign = index % 2 ? 1 : -1;
          var angle = joint.g.toRad(theta + sign * 90);
          // We found the vertex.
          var vertex = joint.g.point.fromPolar(offset, angle, midPoint);
          sibling.set('vertices', [{ x: vertex.x, y: vertex.y }]);
        });
    }
  };


  var myAdjustVertices = _.partial(adjustVertices, graph);
  // adjust vertices when a cell is removed or its source/target was changed
  graph.on('add remove change:source change:target', myAdjustVertices);
  // also when an user stops interacting with an element.
  graph.on('cell:pointerup', myAdjustVertices);

  // vizualizing the inputs

  //removing duplicate states
  var tempset = new Set();
  Array.from(formElement.elements).forEach((input) => {
    if (input.id.startsWith("inputState1_") || input.id.startsWith("inputState2_")) {
      if(!tempset.has(input.value))
      {
        tempset.add(input.value);
        states.push(input.value);
      }
    }
  });

  states.sort((a, b) => {
  const aIndex = parseInt(a.match(/\d+/)); // extract n from y[n]
  const bIndex = parseInt(b.match(/\d+/)); // extract n from y[n]
  return aIndex - bIndex; // sort by n
});

  //creating states
  CreateStates(states);
  div.innerHTML = '';
  //creating links
  var state1, state2, rate;
  Array.from(formElement.elements).forEach((input) => {
    if (input.id.startsWith("inputState1_")) {
      state1 = input.value;
    } else if (input.id.startsWith("inputState2_")) {
      state2 = input.value;
    } else if (input.id.startsWith("inputRate_")) {
      rate = input.value;
      CreateLink(statesmap.get(state1), statesmap.get(state2), rate);

      CreateEquations(state1, state2, rate);
    }
  });
}

function retrieveFormData() {
  // Retrieve the saved data from local storage
  let savedData = localStorage.getItem('formData');

  // If there is saved data, parse it and return it
  if (savedData) {
    return JSON.parse(savedData);
  }

  // If there is no saved data, return an empty object
  return {};
}
function populateForm(formData) {
  // Loop through each input field in the form
  $('#equations input').each(function () {
    // Get the ID of the input field
    let inputId = $(this).attr('id');

    // If the saved data has a value for this input field, set the value of the input field to the saved value
    if (formData.hasOwnProperty(inputId)) {
      $(this).val(formData[inputId]);
    }
  });
}
function createInputs(formData) {
  let numInputs = Object.keys(formData).length / 3; // Divide by 3 since each row has 3 inputs
  let wrapper = $('.wrapper');

  for (let i = 1; i <= numInputs; i++) {
    wrapper.append(`<div class="row row-cols-3" style="padding: 1em;">
        <div class="col-sm-3">
          <input type="text" class="form-control" id="inputState1_${i}" placeholder="State 1" value="${formData['inputState1_' + i]}" />
        </div>
        <div class="col-sm-3">
          <input type="text" class="form-control" id="inputState2_${i}" placeholder="State 2" value="${formData['inputState2_' + i]}" />
        </div>
        <div class="col-sm-5">
          <input type="text" class="form-control" id="inputRate_${i}" placeholder="Rate" value="${formData['inputRate_' + i]}" />
        </div>
        <button class="btn btn-outline-danger remove_field" type="button">Remove</button>
      </div>`);
  }
  return numInputs;
}

