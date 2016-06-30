// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Experiments       - github.com/muaz-khan/WebRTC-Experiment

function getElement(selector) {
    return document.querySelector(selector);
}

var main = getElement('.main');
var usernamelocal = getElement('#user-name-local');

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

function addNewMessage(args) {
    
    if($("#user-name-local").val() && $("#user-name-local").val() == args.header && args.message.trim() != ""){
        var newMessageDIV = document.createElement('div');
        newMessageDIV.className = 'new-message row animated bounce';
    
        var userinfoDIV = document.createElement('div');
        userinfoDIV.className = 'user-info col-md-2';
        userinfoDIV.innerHTML = args.userinfo || '<img class="img-responsive user-info-img" src="images/user.png">';
    
        newMessageDIV.appendChild(userinfoDIV);
    
        var userActivityDIV = document.createElement('div');
        userActivityDIV.className = 'user-activity col-md-10';
    
        userActivityDIV.innerHTML = '<h2 class="header">' + args.header + '</h2>';
    
        var p = document.createElement('p');
        p.className = 'message';
        userActivityDIV.appendChild(p);
        p.innerHTML = args.message;
    
        newMessageDIV.appendChild(userActivityDIV);
    
        main.insertBefore(newMessageDIV, main.lastChild);
        userinfoDIV.style.height = newMessageDIV.clientHeight + 'px';
        if (args.callback) {
            args.callback(newMessageDIV);
        }
    
        document.querySelector('#message-sound').play();
        main.scrollTop = main.scrollHeight;
    }else if($("#user-name-local").val() && args.message.trim() != ""){
        var newMessageDIV = document.createElement('div');
        newMessageDIV.className = 'new-message row animated bounce';
        
        var userActivityDIV = document.createElement('div');
        userActivityDIV.className = 'user-activity col-md-10';
    
        userActivityDIV.innerHTML = '<h2 class="header">' + args.header + '</h2>';
    
        var p = document.createElement('p');
        p.className = 'message';
        userActivityDIV.appendChild(p);
        p.innerHTML = args.message;
    
        newMessageDIV.appendChild(userActivityDIV);
    
        var userinfoDIV = document.createElement('div');
        userinfoDIV.className = 'user-info col-md-2';
        userinfoDIV.innerHTML = args.userinfo || '<img class="img-responsive user-info-img" src="images/user.png">';
    
        newMessageDIV.appendChild(userinfoDIV);
    
        main.insertBefore(newMessageDIV, main.lastChild);
        userinfoDIV.style.height = newMessageDIV.clientHeight + 'px';
        if (args.callback) {
            args.callback(newMessageDIV);
        }
    
        document.querySelector('#message-sound').play();
        main.scrollTop = main.scrollHeight;
    }

   
}

main.querySelector('#your-name').onkeyup = function(e) {
    if (e.keyCode != 13) return;
    main.querySelector('#continue').onclick();
};

main.querySelector('#room-name').onkeyup = function(e) {
    if (e.keyCode != 13) return;
    main.querySelector('#continue').onclick();
};

main.querySelector('#room-name').value = localStorage.getItem('room-name') || (Math.random() * 1000).toString().replace('.', '');
if(localStorage.getItem('user-name')) {
    main.querySelector('#your-name').value = localStorage.getItem('user-name');
}

main.querySelector('#continue').onclick = function() {
    $("#user-name-local-text").text(this.parentNode.querySelector('#your-name').value);
    $("#user-name-local").val(this.parentNode.querySelector('#your-name').value);
    var yourName = this.parentNode.querySelector('#your-name');
    var roomName = this.parentNode.querySelector('#room-name');
    
    if(!roomName.value || !roomName.value.length) {
        roomName.focus();
        return alert('Your MUST Enter Room Name!');
    }
    
    localStorage.setItem('room-name', roomName.value);
    localStorage.setItem('user-name', yourName.value);
    
    yourName.disabled = roomName.disabled = this.disabled = true;

    var username = yourName.value || 'Anonymous';

    rtcMultiConnection.extra = {
        username: username
    };

    addNewMessage({
        header: username,
        message: 'Searching for existing rooms...',
        userinfo: '<img class="img-responsive user-info-img" src="images/information.png">'
    });
    
    var roomid = main.querySelector('#room-name').value;
    rtcMultiConnection.channel = roomid;
	
	var firebaseRoomSocket = new Firebase(rtcMultiConnection.resources.firebaseio + rtcMultiConnection.channel + 'openjoinroom');
	
	firebaseRoomSocket.once('value', function (data) {
		var sessionDescription = data.val();

		// checking for room; if not available "open" otherwise "join"
		if (sessionDescription == null) {
			addNewMessage({
                header: username,
                message: 'No room found. Creating new room...<br /><br />You can share following room-id with your friends: <h3><strong>' + roomid + '</strong></h3>',
                userinfo: '<img class="img-responsive user-info-img" src="images/information.png">'
            });

            rtcMultiConnection.userid = roomid;
            rtcMultiConnection.open({
                dontTransmit: true,
                sessionid: roomid
            });
			
			firebaseRoomSocket.set(rtcMultiConnection.sessionDescription);
					
			// if room owner leaves; remove room from the server
			firebaseRoomSocket.onDisconnect().remove();
		} else {
			addNewMessage({
                header: username,
                message: 'Room found. Joining the room...',
                userinfo: '<img class="img-responsive user-info-img" src="images/information.png">'
            });
            rtcMultiConnection.join(sessionDescription);
            
		}
        $("#continue").attr("disabled","disabled");
        $("#room-name-show").text("Room: " + roomid);
        $(".welcome").addClass("animated fadeOut");
        $(".welcome").css("display", "none");
        $("#user-name-local-container").css("display", "block");
		console.debug('room is present?', sessionDescription == null);
	});
};

function getUserinfo(blobURL, imageURL) {
    return blobURL ? '<div class="embed-responsive embed-responsive-16by9"><video class="embed-responsive-item" src="' + blobURL + '" autoplay controls></video></div>' : '<img class="img-responsive user-info-img" src="' + imageURL + '">';
}

var isShiftKeyPressed = false;

getElement('.main-input-box textarea').onkeydown = function(e) {
    if (e.keyCode == 16) {
        isShiftKeyPressed = true;
    }
};

var numberOfKeys = 0;
getElement('.main-input-box textarea').onkeyup = function(e) {
    numberOfKeys++;
    if (numberOfKeys > 3) numberOfKeys = 0;

    if (!numberOfKeys) {
        if (e.keyCode == 8) {
            return rtcMultiConnection.send({
                stoppedTyping: true
            });
        }

        rtcMultiConnection.send({
            typing: true
        });
    }

    if (isShiftKeyPressed) {
        if (e.keyCode == 16) {
            isShiftKeyPressed = false;
        }
        return;
    }


    if (e.keyCode != 13) return;


    if(this.value.trim() != ""){
            addNewMessage({
                header: rtcMultiConnection.extra.username,
                message: 'says:<br /><br />' + linkify(this.value),
                userinfo: getUserinfo(rtcMultiConnection.blobURLs[rtcMultiConnection.userid], 'images/speech-balloon.png'),
                color: rtcMultiConnection.extra.color
            });
        
            rtcMultiConnection.send(this.value);
    }
    

    this.value = '';
};

getElement('#allow-webcam').onclick = function() {
    this.disabled = true;

    var session = { audio: true, video: true };

    rtcMultiConnection.captureUserMedia(function(stream) {
        var streamid = rtcMultiConnection.token();
        rtcMultiConnection.customStreams[streamid] = stream;

        rtcMultiConnection.sendMessage({
            hasCamera: true,
            streamid: streamid,
            session: session
        });
    }, session);
};

getElement('#allow-mic').onclick = function() {
    this.disabled = true;
    var session = { audio: true };

    rtcMultiConnection.captureUserMedia(function(stream) {
        var streamid = rtcMultiConnection.token();
        rtcMultiConnection.customStreams[streamid] = stream;

        rtcMultiConnection.sendMessage({
            hasMic: true,
            streamid: streamid,
            session: session
        });
    }, session);
};

getElement('#allow-screen').onclick = function() {
    this.disabled = true;
    var session = { screen: true };

    rtcMultiConnection.captureUserMedia(function(stream) {
        var streamid = rtcMultiConnection.token();
        rtcMultiConnection.customStreams[streamid] = stream;

        rtcMultiConnection.sendMessage({
            hasScreen: true,
            streamid: streamid,
            session: session
        });
    }, session);
};

getElement('#share-files').onclick = function() {
    var file = document.createElement('input');
    file.type = 'file';

    file.onchange = function() {
        rtcMultiConnection.send(this.files[0]);
    };
    fireClickEvent(file);
};

function fireClickEvent(element) {
    var evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });

    element.dispatchEvent(evt);
}

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Bytes';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}
