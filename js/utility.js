function getTimeString(sec) {
    var min=0;
    if(sec>=60) {
        min = sec / 60;
        sec = sec % 60;
    }

    var dispSec = parseInt(sec, 10);
    if(dispSec<=9)
        dispSec = '0'+dispSec;
    var time=Math.floor(min)+":"+ dispSec;
    return time;
}

function compare(a, b) {
  try {
	  var aVal = parseFloat(a._source.time);
	  var bVal = parseFloat(b._source.time);
	  if (aVal < bVal)
	     return -1;
	  if (aVal > bVal)
	    return 1;
  } catch (e) {
      console.log("Parse Error: " + e);
  }
  return 0;
}