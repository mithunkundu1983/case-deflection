var receivedresultData = "";

function startSuggesting() {
    var x = document.getElementById("issue");
    var text = "";
    text = x.value;
    var data = {
        "query":{
            "bool":{
                "must":[
                    {
                        "multi_match":{
                            "query":text,
                            "fields":[
                                "issue^4",
                                "resolution"
                            ]
                        }
                    }
                ],
                "should":[
                    {
                        "multi_match":{
                            "query":text,
                            "fields":[
                                "issue^2",
                                "resolution"
                            ],
                            "type":"phrase",
                            "boost":10
                        }
                    },
                    {
                        "multi_match":{
                            "query":text,
                            "fields":[
                                "issue^2",
                                "resolution"
                            ],
                            "operator":"and",
                            "boost":4
                        }
                    }
                ]
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
    $("#divRight").empty();
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
    $("#form-submit").hide();
    $("#divRight").html(text);
}

function footerResolved(){
    $("#suggestionDiv").empty();
    $("#divRight").empty();
    $("#form-submit").show();
    $("#issue").val('');
    var message = "We are pleased to help you.";
    showSnackbar(message);
}

function footerSubmit(){
    $("#suggestionDiv").empty();
    $("#divRight").empty();
    $("#form-submit").show();
    var min=10000;
    var max=99999;
    var random =Math.floor(Math.random() * (+max - +min)) + +min;
    var message = "Issue submitted with id "+random;
    $("#issue").val('');
    showSnackbar(message);
}

function showSnackbar(message, type) {
    $("#snackbar").html(message);
    // Get the snackbar DIV
    var x = document.getElementById("snackbar");

    // Add the "show" class to DIV
    x.className = "show";

    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}