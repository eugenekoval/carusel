var ready = false,
    dragging = false,
    pointerStartPosX = 0,
    pointerEndPosX = 0,
    pointerDistance = 0,
    monitorStartTime = 0,
    monitorInt = 10,
    ticker = 0,
    spinner,
    speed = 1,
    locs,
    img_scale = 100,
    last_img,
    is_div = false,
    is_miniature = false,
    dragginMin = false,
    refresh_speed = 16,
    dragData = null,
    dragDataMin = null,
    offset_zoom,
    totalFrames = 180,
    currentFrame = 0,
    i_offset,
    currentScrollTop = 0,
    tempScrollTop = 0,
    scale = 1,
    frames = [],
    interval = 0,
    endFrame = 0,
    language = 'en',
    offset_div = false,
    koef_little = 6,
    scale_zoom = 1,
    loadedImages = 0;
    
$(document).ready(function () {
    $("#start").attr('src',settings.imageDir+settings.prefix+settings.startImage+'.'+settings.extension);
    i_offset = $("#index").offset();
    set_lang();
    set_localization();
    addSpinner();
    loadImage();
    create_buttons();
    
    $("#bar").css("top",$("#index").offset().top + $("#index").height() - $("#bar").height()*2);
    var zoom = {
        'left' : $("#index").offset().left + $("#index").width() - 40,
        'top' : $("#index").offset().top + 25
    }; 
    $("#zoom_container").offset({'left':zoom.left, 'top':zoom.top});
    
    $("#amount").append(100);
    $("#zoom").slider({
        orientation: "vertical",
        range: "min",
        min: 0.2,
        max: 3,
        value: 1,
        step: 0.1,
        slide: function(event,ui){
            $("#zoom input").val(ui.value); 
            razn = scale - ui.value;
            razn = Math.round(razn*100)/100;
            scale = ui.value;
            img_scale = scale*100;
            if (razn < 0){
                for(i=0;i>razn;i-=0.1){
                    scale_zoom -= 0.05;
                }
            }
            else if(razn > 0){
                for(i=0;i<razn;i+=0.1){
                    scale_zoom += 0.05;
                }
            }
            
            scale_zoom = Math.round(scale_zoom*100)/100;
            //scale_zoom = scale_zoom + (razn/koef_little);
            if (is_miniature == true)
               $("#zoom_border").css('transform', 'scale('+scale_zoom+')');
            $("#index img").css('transform', 'scale('+ui.value+')'); 
            $(".current-div").css('transform', 'scale('+ui.value+')'); 
            if (img_scale > 100 && is_miniature == false){
                showMiniature();
                $("#zoom_border").css('transform', 'scale('+scale_zoom+')');
            }
            if (img_scale <= 100){
                deleteMiniature();
                offset_div = false;
                offset_zoom = false;
            }
            if (img_scale > 100 && is_div == false){
                create_div();
                window_onload();
            }         
            offset_div = $(".current-div").offset();
            offset_zoom = $("#zoom_border").offset();
            
        }
    });
    $("#zoom input").val(6);
    
    $("#radio").buttonset();
    
    $("#index").mousedown(function (event) {
        if (is_div == false){
            offset_div = false;
            $("#index_images").css('cursor','url(../img_sl/closedhand.cur),default');
            event.preventDefault();
            pointerStartPosX = getPointerEvent(event).pageX;
            dragging = true;
            if (interval != 0){
                $("#pause").css('display', 'none');
                $("#left, #right").css('display', 'inline');
                clearInterval(interval);
                interval = 0;
            }
        }
        else{
            delete_div();
            create_div();
            window_onload();
        }
    });
     
    $(document).mouseup(function (event){ 
        $("#index_images").css('cursor','url(../img_sl/openhand.cur),default');
        event.preventDefault();
        dragging = false;
    });
     
    $(document).mousemove(function (event){
        event.preventDefault();
        end = getPointerEvent(event).pageX;
        if (end-pointerStartPosX < 0)
            track('left',Math.abs(end-pointerStartPosX),event);
        else
            track('right',Math.abs(end-pointerStartPosX),event);
        //trackPointer(event);
    });
    
    $("#index").live("touchstart", function (event) {
        event.preventDefault();
        pointerStartPosX = getPointerEvent(event).pageX;
        dragging = true;
        
    });
 
    $("#index").live("touchmove", function (event) {
        event.preventDefault();
        trackPointer(event);
    });
 
    $("#index").live("touchend", function (event) {
        event.preventDefault();
        dragging = false;
    });
     
    
    $("#left").live('click', function(event){
        delete_div();
        deleteMiniature();
        clearInterval(interval);
        $("#left, #right").css('display', 'none');
        $("#pause").css('display', 'inline');
        interval = window.setInterval(function(){
            dragging = true;
            //trackPointer(event,-speed);
            track('left',speed,event);
            dragging = false;
        }, $("#amount").val()); 
    });
    
    $("#right").live('click', function(event){
        delete_div();
        deleteMiniature();
        clearInterval(interval);
        $("#left, #right").css('display', 'none');
        $("#pause").css('display', 'inline');
        interval = window.setInterval(function(){
            dragging = true;
            //trackPointer(event,speed);
            track('right',speed,event);
            dragging = false;
        }, $("#amount").val());
    });
    
    $("#left_long").bind('click', function(event){
        delete_div();
        deleteMiniature();
        clearInterval(interval);
        refresh_speed = 50;
        dragging = true;
        //trackPointer(event, -10);
        track('left',10,event);
        dragging = false;
        refresh_speed = 16;
        displayMoves();
    });
    $("#right_long").bind('click', function(event){
        delete_div();
        deleteMiniature();
        clearInterval(interval);
        refresh_speed = 50;
        dragging = true;
        //trackPointer(event,10);
        track('right',10,event);
        dragging = false;
        refresh_speed = 16;
        displayMoves();
    });    
    
    $("#pause").live('click', function(){
        clearInterval(interval);
        interval = 0;
        displayMoves();
    })
    
    $("#index").mouseenter(function(){
        zoom = true;
    });
    $("#index").mouseleave(function(){
        zoom = false;
    });

    $(window).mousewheel(function(event, delta){
        if (zoom){
            if (delta < 0){
                delta = Math.abs(delta);
                //scale = scale-0.1;
                scale = scale-(delta/10);
                if (scale >= 0.25 && scale <= 3){
                    img_scale -= 10*delta;
                    scale_zoom += 0.05*delta;
                }
            }
            else if (delta > 0){
                //scale = scale+0.1;
                scale = scale+(delta/10);
                if (scale >= 0.25 && scale <= 3){
                    img_scale += 10*delta;
                    scale_zoom -= 0.05*delta;

                }
            }
            scale_zoom = Math.round(scale_zoom*100)/100;
            if (scale <= 0.25) scale = 0.25;
            if (scale >= 3) scale = 3;
            
            if (img_scale > 100){
                if (is_div == false){
                    create_div();
                }
                $(".current-div").css('transform', 'scale('+scale+')');
                if (is_miniature == false){
                    showMiniature();
                }
                window_onload();
            }
            else{
                offset_div = false;
                offset_zoom = false;
                delete_div();
                deleteMiniature();
                $("#index img").css('transform', 'scale('+scale+')');
            }
            if (is_miniature == true)
                $("#zoom_border").css('transform', 'scale('+scale_zoom+')');
            $("#index img").css('transform', 'scale('+scale+')');
            offset_zoom = $("#zoom_border").offset();
            $("#zoom").slider('value',scale);
            oi = $("#index").offset();
            od = $(".current-div").offset();
            os = $("#zoom_border").offset();
            if (od != undefined){
                if (od.left > oi.left){ 
                    $(".current-div").offset({'left':od.left-50});
                    $("#zoom_border").offset({'left':os.left+10});
                }
                if (od.top > oi.top){
                    $(".current-div").offset({'top':od.top-50});
                    $("#zoom_border").offset({'top':os.top+10});
                }
                var k = parseMatrix($(".current-div").css('transform'));
                //console.log(oi.left+500);
                //console.log(od.left + (550*k));
            }
        }
    });
    $("#zoom_border").live('mousemove',function(){
        if (!dragginMin)
            $(this).css('cursor', 'url(../img_sl/openhand.cur),default');
        else
            $(this).css('cursor', 'url(../img_sl/closedhand.cur),default');
    });
    $("#zoom_border").live('mousedown',function(){
        $(this).css('cursor', 'url(../img_sl/closedhand.cur),default');
    });
    
    $("#zoom_border").css('cursor','url(../img_sl/openhand.cur),default');
    $("#zoom_img").live('mousedown',function(){
        if(is_miniature){
            deleteMiniature();
            showMiniature();
            $("#zoom_border").css('transform', 'scale('+scale_zoom+')');
            $("#zoom_border").offset({'left':offset_zoom.left, 'top':offset_zoom.top});
            $("#zoom_border").css('cursor', 'url(../img_sl/closedhand.cur),default');
            window_onload();
        }
    });
});

function parseMatrix(matrix){
    var arr = matrix.split("(");
    var arr2 = arr[1].split(",");
    if (arr2[0] < 2){
        var n = arr2[0];
        var arr3 = n.split(".");
        var t = arr3[1]+"0";
        if (t == 10)
            t = "05";
        else
            t = t/2
        t = 1+"."+t;
        res = t;
    }
    else{
        res = arr2[0]/2;
        console.log(arr2[0]);
    }
    console.log(res);
    return res;
}

function track(type,interval,event){
    if (settings.direction == 1){
        if (type == 'right')
            trackPointer(event,-interval);
        else if (type == 'left')
            trackPointer(event,interval);
    }
    else{
        if (type == 'right')
            trackPointer(event,interval);
        else if (type == 'left')
            trackPointer(event,-interval);
    }
}

function showMiniature(){
    is_miniature = true;
    var src = $(".current-image").attr('src'); 
    $("body").append("<div id='zoom_img'><div id='zoom_border'></div></div>");
    var w = $(".current-image").width()/koef_little;
    var h = $(".current-image").height()/koef_little;
    $("#zoom_img").css({'position':'absolute','z-index':100,'width':w,'height':h, 'top':i_offset.top+10+'px', 'left':i_offset.left+10+'px','margin':0, 'padding':0});
    //$("#zoom_img").css({'background': 'url('+src+')','background-size':''+w+'px '+h+'px'});
    $("#zoom_img").append("<img src='"+src+"' width=100% height=100%>");
    $("#zoom_img").css({'overflow':'hidden'});
    //$("#zoom_img img").css('transform','scale(1)');
    $("#zoom_border").css({'position':'absolute','z-index':1000,'width':w,'height':h});
    if (offset_zoom)
        $("#zoom_border").offset({'left':offset_zoom.left, 'top':offset_zoom.top});
}

function deleteMiniature(){
    if (is_miniature == true){
        $("#zoom_img").remove();
        is_miniature = false; 
    }
}

function create_div(){
    is_div = true;
    var src = $(".current-image").attr('src');
    var w = $(".current-image").css('width');
    var h = $(".current-image").css('height');
    $(".current-image").css('display','none');
    $("#index").append("<div class='current-div' id='current-div'></div>");
    $(".current-div").css({'position':'absolute','z-index':'100','width':w, 'height':h, 'background': 'url('+src+')', 'background-size':''+w+' '+h+''})
    $(".current-div").css('transform', 'scale('+scale+')')
    if (offset_div){
        $(".current-div").offset({left:offset_div.left,top:offset_div.top});
    }
}

function delete_div(){
    is_div = false;
    //offset_div = false;
    $(".current-div").remove();
    $(".current-image").css('display','block');
}

function addSpinner () { 
    spinner = new CanvasLoader("spinner"); 
    spinner.setShape("spiral");
    spinner.setDiameter(90);
    spinner.setDensity(90);
    spinner.setRange(1);
    spinner.setSpeed(4);
    spinner.setColor("#333333");
    spinner.show(); 
    $("#spinner").fadeIn("slow");
};

function loadImage() {  
    var li = document.createElement("li");
    var imageName = settings.imageDir+settings.prefix + (loadedImages + 1) + "."+settings.extension; 
    var image = $('<img>').attr('src', imageName).addClass("previous-image").appendTo(li);
    frames.push(image);
    $("#index_images").append(li);
    $(image).load(function() {
       imageLoaded();
    });
};
    
function imageLoaded() { 
    loadedImages++;
    $("#spinner span").text(Math.floor(loadedImages / settings.totalFrames * 100) + "%");
    if (loadedImages == settings.totalFrames) {
        frames[0].removeClass("previous-image").addClass("current-image");
        $("#spinner").fadeOut("slow", function(){
            spinner.hide();
            $("#start").remove();
            showThreesixty();
        });
        
    } 
    else{
        loadImage();
    }
};

function showThreesixty () { 
    $("#index_images").fadeIn("slow");
    img_width = $(".current-image").width();
    img_height = $(".current-image").height();
    ready = true;
    endFrame = -180; 
    refresh();
};

function render () {
    if(currentFrame !== endFrame){     
        var frameEasing = endFrame < currentFrame ? Math.floor((endFrame - currentFrame) * 0.1) : Math.ceil((endFrame - currentFrame) * 0.1);
        hidePreviousFrame();
        currentFrame += frameEasing; 
        showCurrentFrame();
    } 
    else{
        if (img_scale > 100 && is_miniature == false){
            showMiniature();
            $("#zoom_border").css('transform', 'scale('+scale_zoom+')');
        }
        window.clearInterval(ticker);
        ticker = 0;
        if (img_scale > 100 && is_div == false){ offset_div = {'left':'0px','top':'0px'}; create_div(); window_onload();}
    }
};

function refresh(){ 
    if (ticker === 0){
        ticker = self.setInterval(render, Math.round(refresh_speed));
    }
};   

function hidePreviousFrame() {
    frames[getNormalizedCurrentFrame()].removeClass("current-image").addClass("previous-image");
};
	
function showCurrentFrame() { 
    frames[getNormalizedCurrentFrame()].removeClass("previous-image").addClass("current-image");
};
	
function getNormalizedCurrentFrame() {
    var c = -Math.ceil(currentFrame % settings.totalFrames);
    if (c < 0) c += (settings.totalFrames - 1);
    return c;
};

function getPointerEvent(event) {
    return event.originalEvent.targetTouches ? event.originalEvent.targetTouches[0] : event;
};

function trackPointer(event,flag) { 
    if (ready && dragging) { 
        pointerEndPosX = getPointerEvent(event).pageX; 
        if(monitorStartTime < new Date().getTime() - monitorInt) {
            pointerDistance = (flag) ? flag : pointerEndPosX - pointerStartPosX;
            endFrame = currentFrame + Math.ceil((settings.totalFrames - 1) * settings.speedMultiplier * (pointerDistance / $("#index").width()));
            refresh();
            monitorStartTime = new Date().getTime();
            pointerStartPosX = getPointerEvent(event).pageX;
        }
    }
};

function create_buttons(){
    $("#left_long").button({
        text: false,
        icons: {
            primary: "ui-icon-arrowthick-1-w"
        }
    });
    $("#right_long").button({
        text: false,
        icons: {
            primary: "ui-icon-arrowthick-1-e"
        }
    });
    $("#left").button({
        text: false,
        icons: {
            primary: "ui-icon-triangle-1-w"
        }
    });
    $("#right").button({
        text: false,
        icons: {
            primary: "ui-icon-triangle-1-e"
        }
    });
    $("#pause").button({
        text: false,
        icons: {
            primary: "ui-icon-pause"
        }
    });
}     

function set_lang(){
    var loc = (navigator.language) ? navigator.language : navigator.userLanguage;
    var arr = loc.split('-');
    language = arr[0];
}

function set_localization(){
    locs = {
        "en":{
            "left_play": "Play left",
            "right_play": "Play right",
            "left_move": "Left move",
            "right_move": "Right move",
            'zoom': 'Zoom',
            'speed': 'Speed'
        },
	"ru":{
 	    "left_play": "Карусель влево",
            "right_play": "Карусель вправо",
            "left_move": "Одно движение влево",
            "right_move": "Одно движение вправо",
            'zoom': 'Масштаб',
            'speed': 'Скорость вращения'
 	}
    }
    
    set_titles();
}

function set_titles(){
    if (locs[language]){
        $("#left_long").attr('title', locs[language]['left_play']);
        $("#left").attr('title', locs[language]['left_move']);
        $("#right_long").attr('title', locs[language]['right_play']);
        $("#right").attr('title', locs[language]['right_move']);
        $("#zoom").attr('title', locs[language]['zoom']);
        $("#speed").attr('title', locs[language]['speed']);
    }
}

function leftClick(e){
    dragButtons('l');
}

function rightClick(e){
    dragButtons('r')
}

function window_onload(){
    img = document.getElementById('current-div');
    img_zoom = document.getElementById('zoom_border');
    
    if (window.addEventListener){
        img.addEventListener('mousedown', startDrag, false);
        document.body.addEventListener('mousemove',drag,false); 
        document.body.addEventListener('mouseup',stopDrag,false);
        img_zoom.addEventListener('mousedown',startDragMin,false);
        document.addEventListener('mousemove',dragMin,false); 
        document.addEventListener('mouseup',stopDragMin,false);
    }
    else if (window.attachEvent){
        img.attachEvent('onmousedown', startDrag);
        document.body.attachEvent('onmousemove', drag);
        document.body.attachEvent('onmouseup', stopDrag);
        img_zoom.attachEvent('mousedown',startDragMin);
        document.attachEvent('mousemove',dragMin); 
        document.attachEvent('mouseup',stopDragMin);
    }
}
            
function startDrag(e){ 
    e.preventDefault();
    $("#index").css('cursor','url(../img_sl/closedhand.cur),default');
    if (!dragData){
        e = e||event;
        dragData = {
            x: e.clientX-img.offsetLeft,
            y: e.clientY-img.offsetTop
        };
    }
    
    return false;
};
            
function drag(e){ 
    e.preventDefault();
    if (dragData){
        zoomx = (e.clientX-dragData.x < 0) ? Math.abs((e.clientX-dragData.x)/koef_little)+"px" : "-"+(e.clientX-dragData.x)/koef_little+"px";
        zoomy = (e.clientY-dragData.y < 0) ? Math.abs((e.clientY-dragData.y)/koef_little)+"px" : "-"+(e.clientY-dragData.y)/koef_little+"px";
        border = getBorder();
        e = e||event;
        if (Math.abs(e.clientX-dragData.x) <= border){
            img.style.left = e.clientX-dragData.x+"px";
            img_zoom.style.left = zoomx;
        }
        if (Math.abs(e.clientY-dragData.y) <= border){
            img.style.top = e.clientY-dragData.y+"px";
            img_zoom.style.top = zoomy;
        }
    }   
}
            
function stopDrag(e){
    e.preventDefault();
    $("#index").css('cursor','url(../img_sl/openhand.cur),default');
    offset_zoom = $("#zoom_border").offset();
    if(dragData){
        e = e||event;
        offset_div = $(".current-div").offset();
        console.log(offset_div);
        //img.style.left = e.clientX-dragData.x+"px";
        //img.style.top = e.clientY-dragData.y+"px";
        dragData = null;
        }
}

function startDragMin(e){
    $("#zoom_border").css('cursor','url(../img_sl/closedhand.cur),default');
    e.preventDefault();
    dragginMin = true;
    if (!dragDataMin){
        e = e||event;
        dragDataMin = {
            x: e.clientX-img_zoom.offsetLeft,
            y: e.clientY-img_zoom.offsetTop
        };
    }
    
    return false;
}

function dragMin(e){
    e.preventDefault();
    if (dragDataMin){
        border = getBorderMin();
        e = e||event;
        zoomx = (e.clientX-dragDataMin.x < 0) ? Math.abs((e.clientX-dragDataMin.x)*koef_little)+"px" : "-"+(e.clientX-dragDataMin.x)*koef_little+"px";
        zoomy = (e.clientY-dragDataMin.y < 0) ? Math.abs((e.clientY-dragDataMin.y)*koef_little)+"px" : "-"+(e.clientY-dragDataMin.y)*koef_little+"px";
        if (Math.abs(e.clientX-dragDataMin.x) <= border){
            img_zoom.style.left = e.clientX-dragDataMin.x+"px";
            img.style.left = zoomx;
        }
        if (Math.abs(e.clientY-dragDataMin.y) <= border){
            img_zoom.style.top = e.clientY-dragDataMin.y+"px";
            img.style.top = zoomy;
        }
    }  
}

function stopDragMin(e){
    e.preventDefault();
    $("#zoom_border").css('cursor','url(../img_sl/openhand.cur),default');
    dragginMin = false;
    offset_div = $(".current-div").offset();
    offset_zoom = $("#zoom_border").offset();
    if(dragDataMin){
        e = e||event;
        dragDataMin = null;
    }
}

function dragButtons(param){ 
    //img_l = document.getElementById('zoom_border');
    border = getBorder();
    old = img.style.left;
    //old_l = img_l.style.left;
    arr = old.split('px');
    //arr_l = old_l.split('px');
    old = new Number((arr.length > 0) ? arr[0] : 0);
    //old_l = new Number((arr_l.length > 0) ? arr_l[0] : 0);
    if (param == 'r'){
        old += 10;
        //old_l -= 10/koef_little;
    }
    else{
        old -= 10;
        //old_l += 10/koef_little;
    }
    
    if (Math.abs(old) <= border){
        i = (param == 'l') ? old + 10 : old - 10;
        //j = (param == 'l') ? old_l + 10/koef_little : old_l - 10/koef_little;
        var inter = setInterval(function(){
            if (i == old) clearInterval(inter); 
            img.style.left = i+"px";
            (param == 'l') ? i-- : i++;
        }, 10);
        //img_l.style.left = old_l+"px";
    }
    
    offset_div = $(".current-div").offset();
}

function getBorder(){
    var trans = $(".current-div").css('transform');
    arr = trans.split(',');
    var border = 0;
    for (i=1;i<arr[3];i+=0.1){
        border += 15;
    }
    
    return border;
}

function getBorderMin(){
    var trans = $("#zoom_border").css('transform');
    arr = trans.split(',');
    var border = 0;
    for (i=1;i>arr[3];i-=0.5){
        border += 15;
    }
    
    return border;
}

function displayMoves(){
    $("#pause").css('display','none');
    $('#left').css('display','inline');
    $('#right').css('display','inline');
}






