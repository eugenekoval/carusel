var crs_init = {
    ready:false,        
    dragging:false,     
    pointerStartPosX:0, 
    pointerEndPosX:0,   
    pointerDistance:0,  
    monitorStartTime:0, 
    ticker:0,           
    speed:1,            
    downloaded:false,   
    locs:'',            
    img_scale:100,      
    is_div:false,       
    is_miniature:false, 
    in_zoom:false,      
    dragginMin:false,   
    dragData:null,      
    dragDataMin:null,   
    offset_zoom:'',     
    currentFrame:0,        
    i_offset:'',        
    scale:1,            
    frames:[],          
    interval:0,         
    endFrame:0,         
    language:'en',      
    offset_div:false,   
    koef_little:6,      
    scale_zoom:1,       
    loadedImages:0      
}

    
$(document).ready(function () {
    $("#carusel").append('<div id="rotatorblock"></div>');
    $("#rotatorblock").mouseover(function(){
        $("#rotatorblock").css({'cursor':'url('+settings.cursorsPath+'openhand.cur),default'}); 
    });
    $("#carusel").width($("#rotatorblock").width());
    $("#carusel").height($("#rotatorblock").height());
    $("#rotatorblock").append('<img id="start"><div id="spinner"><span>0%</span></div><ol id="index_images"></ol>');
    $("#carusel").append('<div id="zoom_container"><div id="zoom"><input type="hidden"></div></div>');
    $("#carusel").append('<div id="bar"><table><tr><td align="center"><button id="left_long">play</button><button id="bar_left">play</button><button id="bar_pause">pause</button><button id="bar_right">play</button><button id="right_long">play</button></td></tr></table></div>');
    $("#zoom_container").fadeOut();
    $("#bar").fadeOut();
    $("#start").attr('src',settings.imageDir+settings.prefix+settings.startImage+'.'+settings.extension);
    crs_init.i_offset = $("#rotatorblock").offset();
    crs_set_lang();
    crs_set_localization();
    crs_addSpinner();
    crs_loadImage();
    crs_create_buttons();
    $("#bar").offset({'top': $("#rotatorblock").offset().top + $("#rotatorblock").height() - $("#bar").height()*2});
    var zoom = {
        'left' : $("#rotatorblock").offset().left + $("#rotatorblock").width() - 40,
        'top' : $("#rotatorblock").offset().top + 25
    }; 
    $("#zoom_container").offset({'left':zoom.left, 'top':zoom.top});
    
    $("#amount").append(100);
    $("#zoom").slider({
        orientation: "vertical",
        range: "min",
        min: 1,
        max: 3,
        value: 1,
        step: 0.1,
        slide: function(event,ui){
            $("#zoom input").val(ui.value); 
            razn = crs_init.scale - ui.value;
            razn = Math.round(razn*100)/100;
            crs_init.scale = ui.value;
            crs_init.img_scale = crs_init.scale*100;
            if (razn < 0){
                for(i=0;i>razn;i-=0.1){
                    crs_init.scale_zoom -= 0.05;
                }
            }
            else if(razn > 0){
                for(i=0;i<razn;i+=0.1){
                    crs_init.scale_zoom += 0.05;
                }
            }
            
            crs_init.scale_zoom = Math.round(crs_init.scale_zoom*100)/100;
            //scale_zoom = scale_zoom + (razn/koef_little);
            if (crs_init.is_miniature == true)
               $("#zoom_border").css('transform', 'scale('+crs_init.scale_zoom+')');
            $("#rotatorblock img").css('transform', 'scale('+ui.value+')'); 
            $(".current-div").css('transform', 'scale('+ui.value+')'); 
            if (crs_init.img_scale > 100 && crs_init.is_miniature == false){
                crs_showMiniature();
                $("#zoom_border").css('transform', 'scale('+crs_init.scale_zoom+')');
            }
            if (crs_init.img_scale <= 100){
                crs_deleteMiniature();
                crs_init.offset_div = false;
                crs_init.offset_zoom = false;
            }
            if (crs_init.img_scale > 100 && crs_init.is_div == false){
                crs_create_div();
                crs_window_onload();
            }         
            crs_init.offset_div = $(".current-div").offset();
            crs_init.offset_zoom = $("#zoom_border").offset();
            
        }
    });
    $("#zoom input").val(6);
    
    $("#radio").buttonset();
    
    $("#rotatorblock").mousedown(function (event) { 
        if (crs_init.is_div == false){
            crs_init.offset_div = false;
            $("#index_images").css('cursor','url('+settings.cursorsPath+'closedhand.cur),default');
            event.preventDefault();
            crs_init.pointerStartPosX = crs_getPointerEvent(event).pageX;
            crs_init.dragging = true;
            if (crs_init.interval != 0){
                $("#bar_pause").css('display', 'none');
                $("#bar_left, #bar_right").css('display', 'inline');
                clearInterval(crs_init.interval);
                crs_init.interval = 0;
            }
        }
        else{
            crs_delete_div();
            crs_create_div();
            crs_window_onload();
        }
    });
     
    $(document).mouseup(function (event){ 
        $("#index_images").css('cursor','url('+settings.cursorsPath+'openhand.cur),default');
        event.preventDefault();
        crs_init.dragging = false;
    });
     
    $(document).mousemove(function (event){
        event.preventDefault();
        end = crs_getPointerEvent(event).pageX;
        if (end-crs_init.pointerStartPosX < 0)
            crs_track('left',Math.abs(end-crs_init.pointerStartPosX),event);
        else
            crs_track('right',Math.abs(end-crs_init.pointerStartPosX),event);
        //trackPointer(event);
    });
    
    $("#rotatorblock").live("touchstart", function (event) {
        event.preventDefault();
        crs_init.pointerStartPosX = getPointerEvent(event).pageX;
        crs_init.dragging = true;
        
    });
 
    $("#rotatorblock").live("touchmove", function (event) {
        event.preventDefault();
        crs_trackPointer(event);
    });
 
    $("#rotatorblock").live("touchend", function (event) {
        event.preventDefault();
        crs_init.dragging = false;
    });
     
    
    $("#bar_left").live('click', function(event){
        crs_delete_div();
        crs_deleteMiniature();
        clearInterval(crs_init.interval);
        $("#bar_left, #bar_right").css('display', 'none');
        $("#bar_pause").css('display', 'inline');
        crs_init.interval = window.setInterval(function(){
            crs_init.dragging = true;
            crs_track('left',crs_init.speed,event);
            crs_init.dragging = false;
        }, $("#amount").val()); 
    });
    
    $("#bar_right").live('click', function(event){
        crs_delete_div();
        crs_deleteMiniature();
        clearInterval(crs_init.interval);
        $("#bar_left, #bar_right").css('display', 'none');
        $("#bar_pause").css('display', 'inline');
        crs_init.interval = window.setInterval(function(){
            crs_init.dragging = true;
            crs_track('right',crs_init.speed,event);
            crs_init.dragging = false;
        }, $("#amount").val());
    });
    
    $("#left_long").bind('click', function(event){
        crs_delete_div();
        crs_deleteMiniature();
        clearInterval(crs_init.interval);
        old_refresh_speed = settings.refresh_speed;
        settings.refresh_speed = 50;
        crs_init.dragging = true;
        crs_track('left',10,event);
        crs_init.dragging = false;
        settings.refresh_speed = old_refresh_speed;
        crs_displayMoves();
    });
    $("#right_long").bind('click', function(event){
        crs_delete_div();
        crs_deleteMiniature();
        clearInterval(crs_init.interval);
        old_refresh_speed = settings.refresh_speed;
        settings.refresh_speed = 50;
        crs_init.dragging = true;
        crs_track('right',10,event);
        crs_init.dragging = false;
        settings.refresh_speed = old_refresh_speed;
        crs_displayMoves();
    });    
    
    $("#bar_pause").live('click', function(){
        clearInterval(crs_init.interval);
        crs_init.interval = 0;
        crs_displayMoves();
    })
    
    $("#rotatorblock").mouseenter(function(){
        crs_init.in_zoom = true;
    });
    $("#rotatorblock").mouseleave(function(){
        crs_init.in_zoom = false;
    });

    $(window).mousewheel(function(event, delta){ 
        if (crs_init.in_zoom && crs_init.downloaded){
            event.preventDefault();
            
            if (delta < 0){
                delta = Math.abs(delta);
                //scale = scale-0.1;
                crs_init.scale = crs_init.scale-(delta/10);
                if (crs_init.scale >= 0.99 && crs_init.scale <= 3){
                    crs_init.img_scale -= 10*delta;
                    crs_init.scale_zoom += 0.05*delta;
                }
            }
            else if (delta > 0){
                //scale = scale+0.1;
                crs_init.scale = crs_init.scale+(delta/10);
                if (crs_init.scale >= 0.99 && crs_init.scale <= 3){
                    crs_init.img_scale += 10*delta;
                    crs_init.scale_zoom -= 0.05*delta;

                }
            }
            crs_init.scale_zoom = Math.round(crs_init.scale_zoom*100)/100;
            if (crs_init.scale <= 1) crs_init.scale = 1;
            if (crs_init.scale >= 3) crs_init.scale = 3;
            if (crs_init.img_scale > 100){
                if (crs_init.is_div == false){
                    crs_create_div();
                }
                $(".current-div").css('transform', 'scale('+crs_init.scale+')');
                if (crs_init.is_miniature == false){
                    crs_showMiniature();
                }
                crs_window_onload();
            }
            else{
                crs_init.offset_div = false;
                crs_init.offset_zoom = false;
                crs_delete_div();
                crs_deleteMiniature();
                $("#rotatorblock img").css('transform', 'scale('+crs_init.scale+')');
            }
            if (crs_init.is_miniature == true)
                $("#zoom_border").css('transform', 'scale('+crs_init.scale_zoom+')');
            $("#rotatorblock img").css('transform', 'scale('+crs_init.scale+')');
            crs_init.offset_zoom = $("#zoom_border").offset();
            $("#zoom").slider('value',crs_init.scale);
            oi = $("#rotatorblock").offset();
            od = $(".current-div").offset();
            os = $("#zoom_border").offset();
            iw = $("#rotatorblock").width();
            ih = $("#rotatorblock").height();
            if (od != undefined){
                if (od.left > oi.left){ 
                    $(".current-div").offset({'left':od.left-50});
                    $("#zoom_border").offset({'left':os.left+10});
                }
                if (od.top > oi.top){
                    $(".current-div").offset({'top':od.top-50});
                    $("#zoom_border").offset({'top':os.top+10});
                }
                var k = crs_parseMatrix($(".current-div").css('transform'));
                var r_off = od.left + (iw*k);
                var b_off = od.top + (ih*k)
                if (r_off < oi.left+iw){
                    $(".current-div").offset({'left':od.left+50});
                    $("#zoom_border").offset({'left':os.left-10});
                }
                if (b_off < oi.top+ih){
                    $(".current-div").offset({'top':od.top+50});
                    $("#zoom_border").offset({'top':os.top-10});
                }
                //console.log(od.left+"  "+(550*k)+"  "+(od.left + (550*k)));
            }
        }
    });
    $("#zoom_border").live('mousemove',function(){
        if (!crs_init.dragginMin)
            $(this).css('cursor', 'url('+settings.cursorsPath+'openhand.cur),default');
        else
            $(this).css('cursor', 'url('+settings.cursorsPath+'closedhand.cur),default');
    });
    $("#zoom_border").live('mousedown',function(){
        $(this).css('cursor', 'url('+settings.cursorsPath+'closedhand.cur),default');
    });
    
    $("#zoom_border").css('cursor','url('+settings.cursorsPath+'openhand.cur),default');
    $("#zoom_img").live('mousedown',function(){
        if(crs_init.is_miniature){
            crs_deleteMiniature();
            crs_showMiniature();
            $("#zoom_border").css('transform', 'scale('+crs_init.scale_zoom+')');
            $("#zoom_border").offset({'left':crs_init.offset_zoom.left, 'top':crs_init.offset_zoom.top});
            $("#zoom_border").css('cursor', 'url('+settings.cursorsPath+'closedhand.cur),default');
            crs_window_onload();
        }
    });
});

function crs_parseMatrix(matrix){
    var arr = matrix.split("(");
    var arr2 = arr[1].split(",");
    res = arr2[0];
    return res;
}

function crs_track(type,interval,event){
    if (settings.direction == 1){
        if (type == 'right')
            crs_trackPointer(event,-interval);
        else if (type == 'left')
            crs_trackPointer(event,interval);
    }
    else{
        if (type == 'right')
            crs_trackPointer(event,interval);
        else if (type == 'left')
            crs_trackPointer(event,-interval);
    }
}

function crs_showMiniature(){
    crs_init.is_miniature = true;
    var src = $(".current-image").attr('src'); 
    $("body").append("<div id='zoom_img'><div id='zoom_border'></div></div>");
    var w = $(".current-image").width()/crs_init.koef_little;
    var h = $(".current-image").height()/crs_init.koef_little;
    $("#zoom_img").css({'position':'absolute','z-index':100,'width':w,'height':h, 'top':crs_init.i_offset.top+10+'px', 'left':crs_init.i_offset.left+10+'px','margin':0, 'padding':0});
    $("#zoom_img").append("<img src='"+src+"' width=100% height=100%>");
    $("#zoom_img").css({'overflow':'hidden'});
    $("#zoom_border").css({'position':'absolute','z-index':1000,'width':w,'height':h});
    if (crs_init.offset_zoom)
        $("#zoom_border").offset({'left':crs_init.offset_zoom.left, 'top':crs_init.offset_zoom.top});
}

function crs_deleteMiniature(){
    if (crs_init.is_miniature == true){
        $("#zoom_img").remove();
        crs_init.is_miniature = false; 
    }
}

function crs_create_div(){
    crs_init.is_div = true;
    var src = $(".current-image").attr('src');
    var w = $(".current-image").css('width');
    var h = $(".current-image").css('height');
    $(".current-image").css('display','none');
    $("#rotatorblock").append("<div class='current-div' id='current-div'></div>");
    $(".current-div").css({'position':'absolute','z-index':'100','width':w, 'height':h, 'background': 'url('+src+')', 'background-size':''+w+' '+h+''})
    $(".current-div").css('transform', 'scale('+crs_init.scale+')')
    if (crs_init.offset_div){
        $(".current-div").offset({left:crs_init.offset_div.left,top:crs_init.offset_div.top});
    }
}

function crs_delete_div(){
    crs_init.is_div = false;
    $(".current-div").remove();
    $(".current-image").css('display','block');
}

function crs_addSpinner () {
    if (settings.spinnerPosition == 'center')
        $("#spinner").css({'left':'50%', 'top':'50%', 'margin-left':'-45px', 'margin-top':'-45px'});
    else if (settings.spinnerPosition == 'rightTop')
        $("#spinner").css({'right':'20px', 'top':'20px', 'margin-left':'-45px'});
    else if (settings.spinnerPosition == 'leftTop')
        $("#spinner").css({'left':'20px', 'top':'20px'});
    else if (settings.spinnerPosition == 'centerBottom')
        $("#spinner").css({'left':'50%', 'bottom':'20px', 'margin-left':'-45px', 'margin-top':'-45px'});
    spinner = new CanvasLoader("spinner"); 
    spinner.setShape("spiral");
    spinner.setDiameter(90);
    spinner.setDensity(90);
    spinner.setRange(1);
    spinner.setSpeed(4);
    spinner.setColor("#"+settings.spinnerColor);
    spinner.show(); 
    $("#spinner").fadeIn("slow");
};

function crs_loadImage() {  
    var err = false;
    var i = new String(crs_init.loadedImages+1);
    if (i.length < 2) i = "0"+i;
    var li = document.createElement("li");
    var imageName = settings.imageDir+settings.prefix + (i) + "."+settings.extension; 
    var image = $('<img>').attr('src', imageName).addClass("previous-image").appendTo(li); 
    crs_init.frames.push(image); 
    $("#index_images").append(li); 
    $(image).error(function(){
        settings.totalFrames = 1;
        crs_init.loadedImages = 0;
        crs_imageLoaded(); 
    });
    $(image).load(function(res){
       crs_imageLoaded(); 
    });
};
    
function crs_imageLoaded() {  
    crs_init.loadedImages++;
    $("#spinner span").text(Math.floor(crs_init.loadedImages / settings.totalFrames * 100) + "%");
    if (crs_init.loadedImages == settings.totalFrames) {
        crs_init.frames[0].removeClass("previous-image").addClass("current-image");
        $("#spinner").fadeOut("slow", function(){ //$("#index_images").append(imgs); 
            spinner.hide();
            $("#start").remove();
            crs_showThreesixty();
        });
        
    } 
    else{
        crs_loadImage();
    }
};

function crs_showThreesixty () { 
    $("#index_images").fadeIn("slow");
    $("#zoom_container").fadeIn("slow");
    if (settings.totalFrames != 1)
        $("#bar").fadeIn("slow");
    img_width = $(".current-image").width();
    img_height = $(".current-image").height();
    crs_init.ready = true;
    crs_init.endFrame = -settings.totalFrames; 
    crs_refresh();
};

function crs_render () {
    if(crs_init.currentFrame !== crs_init.endFrame){     
        var frameEasing = crs_init.endFrame < crs_init.currentFrame ? Math.floor((crs_init.endFrame - crs_init.currentFrame) * 0.1) : Math.ceil((crs_init.endFrame - crs_init.currentFrame) * 0.1);
        crs_hidePreviousFrame();
        crs_init.currentFrame += frameEasing; 
        crs_showCurrentFrame();
    } 
    else{
        if (crs_init.img_scale > 100 && crs_init.is_miniature == false){
            crs_showMiniature();
            $("#zoom_border").css('transform', 'scale('+crs_init.scale_zoom+')');
        }
        window.clearInterval(crs_init.ticker);
        crs_init.ticker = 0; 
        crs_init.downloaded = true;
        if (crs_init.img_scale > 100 && crs_init.is_div == false){ crs_init.offset_div = {'left':'0px','top':'0px'}; crs_create_div(); crs_window_onload();}
    }
};

function crs_refresh(){ 
    if (crs_init.ticker === 0){
        crs_init.ticker = self.setInterval(crs_render, Math.round(settings.refresh_speed));
    }
};   

function crs_hidePreviousFrame() {
    crs_init.frames[crs_getNormalizedCurrentFrame()].removeClass("current-image").addClass("previous-image");
};
	
function crs_showCurrentFrame() { 
    crs_init.frames[crs_getNormalizedCurrentFrame()].removeClass("previous-image").addClass("current-image");
};
	
function crs_getNormalizedCurrentFrame() {
    var c = -Math.ceil(crs_init.currentFrame % settings.totalFrames);
    if (c < 0) c += (settings.totalFrames - 1);
    return c;
};

function crs_getPointerEvent(event) {
    return event.originalEvent.targetTouches ? event.originalEvent.targetTouches[0] : event;
};

function crs_trackPointer(event,flag) { 
    if (crs_init.ready && crs_init.dragging) { 
        crs_init.pointerEndPosX = crs_getPointerEvent(event).pageX; 
        if(crs_init.monitorStartTime < new Date().getTime() - 10/*monitorInt*/) { 
            crs_init.pointerDistance = (flag) ? flag : crs_init.pointerEndPosX - crs_init.pointerStartPosX;
            if (flag < 0)
                crs_init.endFrame = crs_init.currentFrame + Math.floor((settings.totalFrames - 1) * settings.speedMultiplier * (crs_init.pointerDistance / $("#rotatorblock").width()));
            else
                crs_init.endFrame = crs_init.currentFrame + Math.ceil((settings.totalFrames - 1) * settings.speedMultiplier * (crs_init.pointerDistance / $("#rotatorblock").width()));
            crs_refresh();
            crs_init.monitorStartTime = new Date().getTime();
            crs_init.pointerStartPosX = crs_getPointerEvent(event).pageX;
        }
    }
};

function crs_create_buttons(){
    $("#left_long").button({
        text: false,
        icons: {
            primary: "bar_button_icon_leftlong"
        }
    });
    $("#right_long").button({
        text: false,
        icons: {
            primary: "bar_button_icon_rightlong"
        }
    });
    $("#bar_left").button({
        text: false,
        icons: {
            primary: "bar_button_icon_left"
        }
    });
    $("#bar_right").button({
        text: false,
        icons: {
            primary: "bar_button_icon_right"
        }
    });
    $("#bar_pause").button({
        text: false,
        icons: {
            primary: "bar_button_icon_pause"
        }
    });
    
    $('.crs_bar_icon').css('background-image','url('+settings.imageServices+'icons.png)');
}     

function crs_set_lang(){
    var loc = (navigator.language) ? navigator.language : navigator.userLanguage;
    var arr = loc.split('-');
    crs_init.language = arr[0];
}

function crs_set_localization(){
    crs_init.locs = {
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
    
    crs_set_titles();
}

function crs_set_titles(){
    if (crs_init.locs[crs_init.language]){
        $("#left_long").attr('title', crs_init.locs[crs_init.language]['left_play']);
        $("#left").attr('title', crs_init.locs[crs_init.language]['left_move']);
        $("#right_long").attr('title', crs_init.locs[crs_init.language]['right_play']);
        $("#right").attr('title', crs_init.locs[crs_init.language]['right_move']);
        $("#zoom").attr('title', crs_init.locs[crs_init.language]['zoom']);
        $("#speed").attr('title', crs_init.locs[crs_init.language]['speed']);
    }
}

function crs_leftClick(e){
    crs_dragButtons('l');
}

function rightClick(e){
    crs_dragButtons('r')
}

function crs_window_onload(){
    img = document.getElementById('current-div');
    img_zoom = document.getElementById('zoom_border');
    
    if (window.addEventListener){
        img.addEventListener('mousedown', crs_startDrag, false);
        document.body.addEventListener('mousemove',crs_drag,false); 
        document.body.addEventListener('mouseup',crs_stopDrag,false);
        img_zoom.addEventListener('mousedown',crs_startDragMin,false);
        document.addEventListener('mousemove',crs_dragMin,false); 
        document.addEventListener('mouseup',crs_stopDragMin,false);
    }
    else if (window.attachEvent){
        img.attachEvent('onmousedown', crs_startDrag);
        document.body.attachEvent('onmousemove', crs_drag);
        document.body.attachEvent('onmouseup', crs_stopDrag);
        img_zoom.attachEvent('mousedown',crs_startDragMin);
        document.attachEvent('mousemove',crs_dragMin); 
        document.attachEvent('mouseup',crs_stopDragMin);
    }
}
            
function crs_startDrag(e){ 
    e.preventDefault();
    $("#rotatorblock").css('cursor','url('+settings.cursorsPath+'closedhand.cur),default');
    if (!crs_init.dragData){
        e = e||event;
        crs_init.dragData = {
            x: e.clientX-img.offsetLeft,
            y: e.clientY-img.offsetTop
        };
    }
    
    return false;
};
            
function crs_drag(e){ 
    e.preventDefault();
    if (crs_init.dragData){
        zoomx = (e.clientX-crs_init.dragData.x < 0) ? Math.abs((e.clientX-crs_init.dragData.x)/crs_init.koef_little)+"px" : "-"+(e.clientX-crs_init.dragData.x)/crs_init.koef_little+"px";
        zoomy = (e.clientY-crs_init.dragData.y < 0) ? Math.abs((e.clientY-crs_init.dragData.y)/crs_init.koef_little)+"px" : "-"+(e.clientY-crs_init.dragData.y)/crs_init.koef_little+"px";
        border = crs_getBorder();
        e = e||event;
        if (Math.abs(e.clientX-crs_init.dragData.x) <= border){
            img.style.left = e.clientX-crs_init.dragData.x+"px";
            img_zoom.style.left = zoomx;
        }
        if (Math.abs(e.clientY-crs_init.dragData.y) <= border){
            img.style.top = e.clientY-crs_init.dragData.y+"px";
            img_zoom.style.top = zoomy;
        }
    }   
}
            
function crs_stopDrag(e){
    e.preventDefault();
    $("#rotatorblock").css('cursor','url('+settings.cursorsPath+'openhand.cur),default');
    crs_init.offset_zoom = $("#zoom_border").offset();
    if(crs_init.dragData){
        e = e||event;
        crs_init.offset_div = $(".current-div").offset();
        //img.style.left = e.clientX-dragData.x+"px";
        //img.style.top = e.clientY-dragData.y+"px";
        crs_init.dragData = null;
        }
}

function crs_startDragMin(e){
    $("#zoom_border").css('cursor','url('+settings.cursorsPath+'closedhand.cur),default');
    e.preventDefault();
    crs_init.dragginMin = true;
    if (!crs_init.dragDataMin){
        e = e||event;
        crs_init.dragDataMin = {
            x: e.clientX-img_zoom.offsetLeft,
            y: e.clientY-img_zoom.offsetTop
        };
    }
    
    return false;
}

function crs_dragMin(e){
    e.preventDefault();
    if (crs_init.dragDataMin){
        border = crs_getBorderMin();
        e = e||event;
        zoomx = (e.clientX-crs_init.dragDataMin.x < 0) ? Math.abs((e.clientX-crs_init.dragDataMin.x)*crs_init.koef_little)+"px" : "-"+(e.clientX-crs_init.dragDataMin.x)*crs_init.koef_little+"px";
        zoomy = (e.clientY-crs_init.dragDataMin.y < 0) ? Math.abs((e.clientY-crs_init.dragDataMin.y)*crs_init.koef_little)+"px" : "-"+(e.clientY-crs_init.dragDataMin.y)*crs_init.koef_little+"px";
        if (Math.abs(e.clientX-crs_init.dragDataMin.x) <= border){
            img_zoom.style.left = e.clientX-crs_init.dragDataMin.x+"px";
            img.style.left = zoomx;
        }
        if (Math.abs(e.clientY-crs_init.dragDataMin.y) <= border){
            img_zoom.style.top = e.clientY-crs_init.dragDataMin.y+"px";
            img.style.top = zoomy;
        }
    }  
}

function crs_stopDragMin(e){
    e.preventDefault();
    $("#zoom_border").css('cursor','url('+settings.cursorsPath+'openhand.cur),default');
    crs_init.dragginMin = false;
    crs_init.offset_div = $(".current-div").offset();
    crs_init.offset_zoom = $("#zoom_border").offset();
    if(crs_init.dragDataMin){
        e = e||event;
        crs_init.dragDataMin = null;
    }
}

function crs_dragButtons(param){ 
    //img_l = document.getElementById('zoom_border');
    border = crs_getBorder();
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
    
    crs_init.offset_div = $(".current-div").offset();
}

function crs_getBorder(){
    var trans = $(".current-div").css('transform');
    arr = trans.split(',');
    var border = 0;
    for (i=1;i<arr[3];i+=0.1){
        border += 15;
    }
    
    return border;
}

function crs_getBorderMin(){
    var trans = $("#zoom_border").css('transform');
    arr = trans.split(',');
    var border = 0;
    for (i=1;i>arr[3];i-=0.5){
        border += 15;
    }
    
    return border;
}

function crs_displayMoves(){
    $("#bar_pause").css('display','none');
    $('#bar_left').css('display','inline');
    $('#bar_right').css('display','inline');
}







