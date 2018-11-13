function CreateHeading(len) {
    var para = document.createElement("P");
    para.classList.add("countToolbar", "border-bottom", "countText");
    var t;
    if (len ==0)
        t = document.createTextNode("No video found");
    else if(len==1)
        t = document.createTextNode(len+" Video found");
    else
        t = document.createTextNode(len+" Videos found");
    para.appendChild(t);
    document.getElementById("heading").appendChild(para);
}

function Create(name,url,i,resultData,text1) {
    var row_master_div = document.createElement("tr");
    row_master_div.classList.add("videoSearch");

    var vid_master_div = document.createElement("div");
    vid_master_div.classList.add("videoDiv");

    var details_master_div = document.createElement("div");
    details_master_div.classList.add("videoDetailsDiv");

    var video_name = document.createElement("div");
    video_name.classList.add("videoname");
    var video_text = document.createTextNode((i+1) + ". " + name+"\n");
    video_name.appendChild(video_text);

    vid_master_div.appendChild(video_name);

    var video_frame = document.createElement("video");
    video_frame.id="videoFrame"+i;
    video_frame.controls="true";
    video_frame.setAttribute("src",url);
    vid_master_div.appendChild(video_frame);

    var btnHolderDiv = document.createElement("div");
    btnHolderDiv.id = "HolderDiv";
    var dnld_anchor = document.createElement('a');
    dnld_anchor.href = url;
    var dnld_btn = document.createElement('button');
    dnld_btn.classList.add("btn","green");
    var element_i = document.createElement('i');
    element_i.classList.add("fa","fa-download");
    dnld_btn.appendChild(element_i);
    var dnld_text = document.createTextNode("Download");
    dnld_btn.appendChild(dnld_text);
    dnld_anchor.appendChild(dnld_btn);
    btnHolderDiv.appendChild(dnld_anchor);

    vid_master_div.appendChild(btnHolderDiv);
    row_master_div.appendChild(vid_master_div);

    if (null != resultData.hits.hits[i].inner_hits) {
        var len1=resultData.hits.hits[i].inner_hits.subtitle.hits.hits.length;

        details_master_div.setAttribute("style","font-weight: bold;");

        var timeButtonHolder= document.createElement("div");
        timeButtonHolder.classList.add("timeButtonHolder","border-bottom");

        var sub= document.createElement("p");
        sub.classList.add("subtitle");
        sub.id="sub"+i;
        details_master_div.appendChild(sub);

        for(var j=0;j<len1;j++)
        {
            var hits = resultData.hits.hits[i].inner_hits.subtitle.hits.hits;
            hits = hits.sort(compare);

            var lines = hits[j];

            var timeButton = document.createElement("button");
            timeButton.classList.add("timeButton","btn","green");

            var timeString = getTimeString(lines._source.time);
            var t1 = document.createTextNode(timeString);       // Create a text node
            timeButton.setAttribute('data',timeString+" - "+lines._source.word);
            timeButton.id = i+"####"+lines._source.time;
            timeButton.appendChild(t1);
            timeButton.addEventListener('click', function() {
                var v=this.id;
                var l=v.length;
                var frame_number="";
                var time="";
                var f=0;
                for(var i=0;i<l;i++){
                    var ch=v[i];
                    if(ch!='#' && f==0)
                        frame_number+=ch;
                    else if(ch=='#'){
                        f=1;
                        continue;
                    }
                    if(ch!='#' && f==1)
                        time+=ch;
                }
                video_frame.currentTime = time;

                var data1=this.getAttribute('data');
                var text2=text1;
                var time1=data1.substring(0,5);

                text2="<span style='background-color:#e2f442;'>"+text2+"</span>";
                time2="<span style='color:#272727;'>"+time1+"</span>";
                var re = new RegExp(text1, "ig");
                data1=data1.replace(re,text2);
                data1=data1.replace(time1,time2);
                var text = document.createElement("p");
                text.classList.add("subtitletext");
                text.innerHTML = data1;
                document.getElementById("videoFrame"+frame_number).play();
                var t2 = document.createTextNode(text);
                document.getElementById("sub"+frame_number).innerHTML= "";
                document.getElementById("sub"+frame_number).appendChild(text);
            }, false);

            timeButtonHolder.appendChild(timeButton);
            details_master_div.appendChild(timeButtonHolder);
            row_master_div.appendChild(details_master_div);

            document.getElementById("vd").appendChild(row_master_div);

            document.getElementById("sub"+i).setAttribute("style", "color:#747474; font-size: 120%;");
        }
    } else {
        document.getElementById("vd").appendChild(row_master_div);
    }
}

function dispResult(a,b,resultData,text) {

    for(var i=a;i<b;i++){
        var name=resultData.hits.hits[i]._source.name;
        var url=resultData.hits.hits[i]._source.url;
        Create(name,url,i,resultData,text);
    }
}

function search() {
    // console.log("yes");
    var x = document.getElementById("search");
    var text = "";
    text = x.value;
    var data = {
        "_source": {
            "includes": ["name","url"]
        },
        "query": {
            "nested": {
                "path": "subtitle",
                "query": {
                    "match_phrase_prefix": {
                        "subtitle.word":text
                    }
                },
                "inner_hits": {
                    "size": 99,
                    "highlight": {
                        "fields": {
                            "subtitle.time": {}
                        }
                    }
                }
            }
        }
    }
    if ("*" === text) {
        data = {
            "query": {
                "match_all": {}
            }
        }
    }
    $.ajax({
        type : 'POST',
        url: "https://search-esawskol-p2qmao574p4skf63bo7ssbi66a.us-west-2.es.amazonaws.com/media/_search?size=100",
        data: JSON.stringify(data),
        contentType: "application/json",
        success: function(resultData){
            document.getElementById("heading").innerHTML = "";
            document.getElementById("vd").innerHTML = "";
            document.getElementById("name_url").innerHTML = "";
            document.getElementById("more").innerHTML = "";
            var len=resultData.hits.hits.length;
            CreateHeading(len);
            if(len==0){}
            // console.log("No videos");
            else{
                dispResult(0,len,resultData,text);
            }
        }
    });
}