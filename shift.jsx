// AE Shift Button
// Vsevolod Oparin, 2021
// MIT License

function fixPropertyMoveLayers(obj, time, delta) {
    if ('numProperties' in obj) {
      for (var i = 1; i <= obj.numProperties; i++) {
        fixPropertyMoveLayers(obj.property(i), time, delta);
      }
    }
    if ('numKeys' in obj) {
      var tempDict = {};
      while (obj.numKeys != 0) {
        tempDict[obj.keyTime(1)] = obj.keyValue(1);
        obj.removeKey(1);
      }
      for (var k in tempDict) {
        v = tempDict[k];
        if (k < time) {
          obj.setValueAtTime(k, v);    
        } else {
          obj.setValueAtTime(eval(k) + delta, v);
        }
      }
    }
}

function moveLayersByDelta_(thisObj, mItem, mTime, delta) {
    mItem.duration += delta;
    for (var layerIdx = 1; layerIdx <= mItem.numLayers; layerIdx++) {
        var layer = mItem.layer(layerIdx);
        if (mTime <= layer.inPoint) {
            layer.startTime += eval(delta);
        } else if (mTime <= layer.outPoint) {            
            fixPropertyMoveLayers(layer, mTime, delta);
            if ('source' in layer && layer.source != null && layer.source.typeName == 'Composition') {
                moveLayersByDelta_(thisObj, layer.source, mTime - layer.inPoint, delta);
            } else {
                layer.outPoint += delta;
            }
        }
    }
}

function moveLayersByDelta(thisObj, mItem, delta) {
    app.beginUndoGroup("Move by delta");
    
    var mTime = mItem.time;  
    moveLayersByDelta_(thisObj, mItem, mTime, delta);

    app.endUndoGroup();
}

function bPos(idx) {
    return [10, 10 + idx * 25, 100, 30 + idx * 25];
}

function addButton(thisObj, position, title, func) {
    var button = thisObj.add("button", position, title);
    button.enabled = true;
    button.onClick = func; 
}

function buildGUI(thisObj) {
    
    deltaShift = thisObj.add(
        "edittext", 
        bPos(0), 
        "0.0"
    );
    
    addButton(
    	thisObj,
    	bPos(1),
    	"Shift",
    	function() {
            moveLayersByDelta(
                thisObj, 
                app.project.activeItem, 
                eval(deltaShift.text)
            );
        }
    );
}

buildGUI(this);
