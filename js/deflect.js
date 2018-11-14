var receivedresultData = "";

function startSuggesting() {
    console.log("yes");
    var x = document.getElementById("issue");
    var text = "";
    text = x.value;
    var data = {
        "query": {
            "multi_match" : {
                "query":    text,
                "fields": [ "issue^2", "resolution" ]
            }
        },
        "highlight" : {
            "number_of_fragments" : 3,
            "fragment_size" : 150,
            "fields" : {
                "issue" : { "pre_tags" : ["<strong>"], "post_tags" : ["</strong>"] },
                "resolution" : { "pre_tags" : ["<strong>"], "post_tags" : ["</strong>"] }
            }
        }
    }
    if ("" === text) {
        clearSuggestions();
    }
    else {
        $.ajax({
            type: 'POST',
            url: "https://search-esawskol-p2qmao574p4skf63bo7ssbi66a.us-west-2.es.amazonaws.com/deflectors/_search",
            data: JSON.stringify(data),
            contentType: "application/json",
            success: function (resultData) {
                receivedresultData  = resultData;
                document.getElementById("heading").innerHTML = "";
                document.getElementById("vd").innerHTML = "";
                document.getElementById("name_url").innerHTML = "";
                document.getElementById("more").innerHTML = "";
                var len = resultData.hits.hits.length;
                clearSuggestions();
                if (len == 0) {
                }
                else {
                    dispResult(0, len, resultData, text);
                }
            }
        });
    }
}

function dispResult(a,b,resultData,text) {
    for(var i=a;i<b;i++){
        var data = new Object();
        if(resultData.hits.hits[i].highlight.issue)
            data.issue=resultData.hits.hits[i].highlight.issue;
        else
            data.issue=resultData.hits.hits[i]._source.issue;

        if(resultData.hits.hits[i].highlight.resolution)
            data.resolution=resultData.hits.hits[i].highlight.resolution;
        else
            data.resolution=resultData.hits.hits[i]._source.resolution;

        data.id = i;

        populateSuggestions(data);
    }
}

function clearSuggestions(){
    $("#suggestionDiv").empty();
}

function populateSuggestions(data) {
    var template = $("#mp_template").html();
    var text = Mustache.render(template, data);
    $("#suggestionDiv").append(text);
}

function midDivClicked(id) {
    var data = new Object();
    data.issue = receivedresultData.hits.hits[id]._source.issue;
    data.resolution = receivedresultData.hits.hits[id]._source.resolution;
    var template = $("#rp_template").html();
    var text = Mustache.render(template, data);
    $("#divRight").html(text);
}