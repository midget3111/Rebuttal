'use strict';

onstart.push(() => {

    // Helpful functions

    const showLogin = () => {
        el.appWindow.style.display = 'none';
        el.loginWindow.style.display = '';

        el.loginEmail2.style.display = 'none';
        el.loginPassword2.style.display = 'none';
        el.loginUser.style.display = 'none';
    }

    const showLoginWithSignUp = () => {
        el.appWindow.style.display = 'none';
        el.loginWindow.style.display = '';

        el.loginButton.value = 'Sign Up';
    }

    const showApp = () => {
        el.appWindow.style.display = '';
        el.loginWindow.style.display = 'none';
    }

    const showInvite = () => {
        el.popupinvite.style.display = 'flex';
    }

    const hideInvite = () => {
        el.popupinvite.style.display = 'none';
    }

    const setLoginMessage = (message) => {
        el.loginReply.innerText = message;
    }

    const div = ({ className, id }) => {
        var d = document.createElement("div");
        if (className) { d.className = className; }
        if (id) { d.id = id; }
        return d;
    }

    const img = ({ className, id, src }) => {
        var i = document.createElement('img');
        if (className) { i.className = className; }
        if (id) { i.id = id; }
        if (src) {
            i.src = 'img/' + theme + '/' + src;
            i.dataset.src = src;
        }
        return i;
    }

    const closeContextMenu = () => {
        console.log('Close menu');
        el.contextmenu.style.display = 'none';
    }

    const openConfirmContext = (question, answer, callback) => {
        var list = [
            { text: question },
            { text: answer, callback }
        ];
        showContextMenu(list, window.mouseX, window.mouseY);
    }

    const setUserList = (userList) => {

        var elementParent = div({ className: 'userListParent' });
        if (hasPerm('inviteUser')) {
            var inviteDiv = div({ className: 'invitebutton' });
            inviteDiv.onclick = () => {
                showInvite();
            };
            inviteDiv.innerText = 'Invite someone';

            elementParent.appendChild(inviteDiv);
        }

        userList.forEach((user) => {
            if (user.hidden) {
                return;
            }
            var elementUser = div({ className: 'user' });
            var textUser = div({ className: 'usertext' });
            var imageUser = img({ className: 'userimg', src: 'avatar.png' });
            textUser.innerText = user.name;
            elementUser.appendChild(imageUser);
            elementUser.appendChild(textUser);

            elementUser.oncontextmenu = (e) => {
                e.preventDefault();
                var list = [];
                if (hasPerm('renameUser')) {
                    list.push({ text: 'Change user name', callback: () => { } });
                }
                if (hasPerm('setUserGroup')) {
                    list.push({ text: 'Change user group', callback: () => { } });
                }
                if (hasPerm('removeUser')) {
                    list.push({
                        text: 'Delete User', callback: () => {
                            openConfirmContext('Confirm delete ' + user.name, 'DELETE USER', () => {
                                send({
                                    type: 'removeuser',
                                    userid: user.id
                                });
                            })
                        }
                    });
                }
                showContextMenu(list, mouseX(e), mouseY(e))

            }

            elementParent.appendChild(elementUser);
        });
        el.appUserList.innerText = '';
        el.appUserList.appendChild(elementParent);
    }

    const mouseX = (evt) => {
        if (evt.pageX) {
            return evt.pageX;
        } else if (evt.clientX) {
            return evt.clientX + (document.documentElement.scrollLeft ?
                document.documentElement.scrollLeft :
                document.body.scrollLeft);
        } else {
            return null;
        }
    }

    const mouseY = (evt) => {
        if (evt.pageY) {
            return evt.pageY;
        } else if (evt.clientY) {
            return evt.clientY + (document.documentElement.scrollTop ?
                document.documentElement.scrollTop :
                document.body.scrollTop);
        } else {
            return null;
        }
    }

    const showContextMenu = (list, x, y) => {
        el.contextmenu.style.display = 'none';
        if (x > (window.width / 2)) {
            x = x + 2;
            el.contextmenu.style.right = x + "px"
            delete el.contextmenu.style.left;
        } else {
            x = x - 2;
            el.contextmenu.style.left = x + "px"
            delete el.contextmenu.style.right;
        }
        if (y > (window.height / 2)) {
            y = y + 2;
            el.contextmenu.style.bottom = y + "px"
            delete el.contextmenu.style.top;
        } else {
            y = y - 2;
            el.contextmenu.style.top = y + "px"
            delete el.contextmenu.style.bottom;
        }
        el.contextmenu.innerHTML = '';

        list.forEach(item => {
            var itemdiv = div({ className: 'contextmenuitem' });
            itemdiv.innerText = item.text;
            if ('callback' in item) {
                itemdiv.onclick = () => { closeContextMenu(); item.callback(); };
            }
            el.contextmenu.appendChild(itemdiv);
        })
        el.contextmenu.style.display = "block";
        el.contextmenu.onmouseleave = (e) => {
            delete el.contextmenu.onmouseout;
            el.contextmenu.style.display = 'none';
        }
    }

    const setRoomList = (roomList) => {
        var elementParent = div({ className: 'roomListParent' });
        roomList.forEach((room) => {
            var elementRoom = div({ className: 'room' });
            elementRoom.oncontextmenu = (e) => {
                e.preventDefault();
                var list = [];
                if (room.type == 'voice') {
                    if (currentView == room.id) {
                        // User is in this room
                        list.push({ text: "Leave chat", callback: () => { switchRoom(null) } });
                    } else {
                        list.push({ text: "Join chat", callback: () => { switchRoom(room.id) } });
                    }
                }
                if (hasPerm('renameRoom')) {
                    list.push({ text: 'Change room name', callback: () => { } });
                }
                if (hasPerm('removeRoom')) {
                    list.push({ text: 'Delete room', callback: () => { } });
                }
                showContextMenu(list, mouseX(e), mouseY(e))

            }
            elementRoom.onclick = () => {
                switchRoom(room.id);
            }
            var textRoom = div({ className: 'roomtext' });
            var imageRoom
            if (room.type === 'voice') {
                imageRoom = img({ className: 'roomimg', src: 'vroom.png' });
            } else {
                imageRoom = img({ className: 'roomimg', src: 'room.png' });
            }
            var usersInRoom = div({ className: 'roomusers' });
            textRoom.innerText = room.name;

            room.userlist.forEach((user) => {
                var elementUser = div({ className: 'user' });
                var textUser = div({ className: 'usertext' });
                var imageUser = img({ className: 'userimg', src: 'avatar.png' });
                textUser.innerText = user.name;
                elementUser.appendChild(imageUser);
                elementUser.appendChild(textUser);

                usersInRoom.appendChild(elementUser);
            });


            elementRoom.appendChild(imageRoom);
            elementRoom.appendChild(textRoom);
            elementParent.appendChild(elementRoom);
            elementParent.appendChild(usersInRoom);
        });
        el.appRoomList.innerText = '';
        el.appRoomList.appendChild(elementParent);
        populateRoom();
    }

    send = (message) => {
        ws.send(JSON.stringify(message));
    }

    const connect = () => {
        ws = new WebSocket("wss://" + location.hostname + (location.port ? ':' + location.port : '') + "/ipc");
        ws.onmessage = (message) => {
            const data = JSON.parse(message.data);
            if (data['type'] in wsFunc) {
                wsFunc[data['type']](data);
            } else {
                console.log("Unknown message type : " + data['type']);
                console.log(data);
            }
        };
        ws.onclose = () => {
            console.log("Connection lost");
            ws = null;
            showLogin();
            setLoginMessage('Connection Lost');
        };
    }

    const wsFunc = {
        "connect": (data) => {
            el.loginlogo.src = data.icon;
            el.logintitle.innerText = data.message;
            themelist = data.themelist;
            updateThemesInSettings();
        },
        "disconnect": (data) => {
            console.log("Removing peer data " + data.userid);
            cleanupStream(data.userid);
        },
        "login": (data) => {
            const { success, userid } = data;
            if (success) {
                showApp();
                setLoginMessage('');
                iam = userid;
            } else {
                showLogin();
                setLoginMessage('Invalid email or password');
            }
        },
        "refreshNow": (data) => {
            window.location.href = '/';
        },
        "updateUsers": (data) => {
            userlist = data.userList;
            setUserList(data.userList);
        },
        "updateRooms": (data) => {
            roomlist = data.roomList;
            setRoomList(data.roomList);
            roomlist.forEach(room => {
                if (!(room.id in messagelist) && room.type === 'text') {
                    send({ type: 'getmessages', roomid: room.id });
                }
            });
        },
        "joinRoom": (data) => {
            const { userid, roomid } = data;
            if (userid === iam) {
                currentView = roomid;
            }
        },
        "updateText": (data) => {
            const { roomid, segment, messages } = data;
            if (!(roomid in messagelist)) {
                messagelist[roomid] = [];
            }
            messagelist[roomid][segment] = messages;
            if (currentView === roomid) {
                populateRoom();
            }
        },
        "leaveRoom": (data) => {
            const { userid } = data;
            if (userid === iam) {
                currentView = null;
                peerConnection = [];
                remoteWebcamStream = [];
            } else {
                cleanupStream(userid);
            }
        },
        "groupplay": (data) => {
            const { roomid, url } = data;
            if (currentView === roomid) {
                sharedVideo = url;
                if (url) {
                    populateRoom();
                }
            }
        },
        "error": (data) => {
            console.log(data);
        },
        "video": (data) => {
            const { payload, touserid, fromuserid } = data;
            if (touserid !== iam) { return; }
            if (payload.candidate) {
                payload.type = 'candidate';
            }
            switch (payload.type) {
                case "offer":
                    if (fromuserid in peerConnection) {
                        break;
                    }

                    createPeerConnection(fromuserid);
                    if (peerConnection[fromuserid].signalingState != "stable") {
                        peerConnection[fromuserid].setLocalDescription({ type: "rollback" });
                    }
                    peerConnection[fromuserid].setRemoteDescription(new RTCSessionDescription(payload));
                    peerConnection[fromuserid].createAnswer()
                        .then((sD) => { peerConnection[fromuserid].setLocalDescription(sD); send({ payload: sD, type: 'video', fromuserid: touserid, touserid: fromuserid }) })
                    break;
                case "answer":
                    peerConnection[fromuserid].setRemoteDescription(new RTCSessionDescription(payload))
                        .then(() => send({ payload: peerConnection[fromuserid].localDescription, type: 'video', fromuserid: touserid, touserid: fromuserid })
                        );
                    break;
                case "candidate":
                    if (peerConnection[fromuserid]) {
                        var newpayload = {
                            candidate: payload.candidate,
                            sdpMLineIndex: payload.sdpMLineIndex
                        }
                        peerConnection[fromuserid].addIceCandidate(
                            new RTCIceCandidate(newpayload)).catch(e => { console.log(e); console.log(e.trace) });

                    }
                    break;
                case "fuckoff":
                    cleanupStream(fromuserid);
                    break;
                case "callme":
                    startCall(fromuserid);
                    break;
            }
        },
        "updatePerms": (data) => {
            permissions = data.perms;
            updatePerms();
        },
        "updateGroups": (data) => {
            groups = data.groups;
            updateGroups();
        },
        'invite': (data) => {
            var { url } = data;
            var link = new URL('/?' + url, document.baseURI).href;
            el.inviteuserreply.innerText = link;
            el.onclick = () => {
                navigator.clipboard.writeText(link).then(() => { }, () => { });
            }
        }
    }

    const hasPerm = (perm) => {
        return permissions.indexOf(perm) > -1;
    }

    const updatePerms = () => {
        // Set elements based on if the user is allowed specific actions
        if (hasPerm('createRoom') || hasPerm('createUser')) {
            el.serverbutton.style.display = 'block';
        } else {
            el.serverbutton.style.display = 'none';
        }
    }

    const updateGroups = () => {
        var override = hasPerm("inviteUserAny");
        el.createusergroup.innerText = '';
        el.inviteusergroup.innerText = '';

        Object.keys(groups).forEach(group => {
            var opt = document.createElement('option');
            opt.value = group;
            opt.innerText = group;
            el.createusergroup.appendChild(opt);
            var pL = groups[group];
            var allowInvitesFor = pL.indexOf('noInviteFor') === -1;
            if (override || allowInvitesFor) {
                var opt2 = document.createElement('option');
                opt2.value = group;
                opt2.innerText = group;
                el.inviteusergroup.appendChild(opt2);
            }
        })


    }

    // 'Next step' in login process.
    const processLogin = () => {
        var email = el.loginEmail.value;
        var email2 = el.loginEmail2.value;
        var user = el.loginUser.value;
        var password = el.loginPassword.value;
        var password2 = el.loginPassword2.value;

        el.loginReply.innerText = ''
        if (signUpCode) {
            if (!email) { el.loginEmail.focus(); return; }
            if (!(email.indexOf('@') > -1 && email.indexOf('.') > -1)) {
                el.loginReply.innerText = 'Please use an email address'
                el.loginEmail.focus(); return;
            }
            if (email !== email2) {
                el.loginReply.innerText = 'Email Addresses must match!'
                el.loginEmail2.focus(); return;
            }
            if (!user) { el.loginUser.focus(); return; }
            // TODO Probably want to be less stringent
            if (!user.match(/^[a-zA-Z0-9-_ ]+$/)) {
                el.loginReply.innerText = 'Username must only contain alphanumeric, dash, underscore and space';
                el.loginUser.focus(); return;
            }
            if (user.length < 3) {
                el.loginReply.innerText = 'Username must be longer than 3 characters';
                el.loginUser.focus(); return;
            }
            if (!password) { el.loginPassword.focus(); return; }
            if (password.length < 7) {
                el.loginReply.innerText = 'Password must be at least 7 characters';

            }
            if (password !== password2) {
                el.loginReply.innerText = 'Passwords must match!'
                password2.focus(); return;
            }

            send({
                type: 'signup',
                email,
                password,
                userName: user,
                signUp: signUpCode

            })

        } else {
            if (email) {
                if (password) {
                    send({ type: 'login', email, password });
                    startLocalDevices();
                } else {
                    el.loginPassword.focus();
                }
            } else {
                el.loginEmail.focus();
            }
        }
    }

    const getRoom = (roomid) => {
        var ret = null;
        roomlist.forEach((room) => {
            if (room.id == roomid) {
                ret = room
            }
        });
        return ret;
    }

    const populateRoom = () => {
        var room = getRoom(currentView);
        if (!room) {
            el.appCoreView.innerText = '';
            return;
        }
        var contents = div({});
        var after = null;
        if (room.type === 'voice') {
            var liveDiv = div({ className: 'appLiveRoom' });
            var voiceDiv = div({ className: 'appVoiceRoom' });
            contents.className = 'appContainer';
            var count = 0;
            if (sharedVideo) {
                var divcont = div({ className: 'videodiv', id: 'sharedVideoDiv' });
                var video = document.getElementById('sharedVideo');
                if (!video) {
                    video = document.createElement('video');
                    video.setAttribute('autoPlay', true);
                    video.setAttribute('playsInline', true);
                    video.setAttribute('id', 'sharedVideo');
                    video.src = sharedVideo;
                    video.onended = () => {
                        video.pause();
                        video.removeAttribute('src'); // empty source
                        video.load();
                        sharedVideo = null;
                        var divrm = document.getElementById('sharedVideoDiv');
                        divrm.parentElement.removeChild(divrm);
                        playToGroup(null);
                    };


                    //<video src="youtu.be/MLeIBFYY6UY" controls="true"></video>
                }
                divcont.appendChild(video);
                voiceDiv.appendChild(divcont);
            }

            room.userlist.forEach((user) => {

                // Create a Video element for voice chat
                var divid = div({ className: 'videodiv' });
                var video = document.createElement('video');
                video.setAttribute('autoPlay', true);
                video.setAttribute('playsInline', true);
                video.setAttribute('id', 'video-' + user.id);
                divid.appendChild(video);
                voiceDiv.appendChild(divid);
                if (user.livestate) {
                    var livediv = div({ className: 'livediv' });
                    var livevideo = document.createElement('video');
                    livevideo.setAttribute('autoPlay', true);
                    livevideo.setAttribute('playsInline', true);
                    livevideo.setAttribute('id', 'live-' + user.id);
                    if (user.id === iam) {
                        if (localLiveStream !== null) {
                            livevideo.srcObject = localLiveStream;
                        }
                    } else {
                        if (user.id in remoteLiveStream) {
                            livevideo.srcObject = remoteLiveStream[user.id];
                        }
                    }
                    livediv.appendChild(livevideo);
                    liveDiv.appendChild(livediv);
                    count++;
                }

                // If Me
                if (user.id === iam) {
                    video.muted = true;

                    if (localWebcamStream !== null) {
                        video.srcObject = localWebcamStream;
                        video.classList.add('selfie');
                        if (el.settingFlipWebcam.checked) {
                            video.style.transform = 'rotateY(180deg)';
                        }
                    }
                } else {
                    if (user.id in remoteWebcamStream) {
                        video.srcObject = remoteWebcamStream[user.id];
                    } else {
                        startCall(user.id);
                    }
                }


            });
            if (count > 0) {
                contents.appendChild(liveDiv);
            }
            contents.appendChild(voiceDiv);
        } else if (room.type === 'text') {

            var scrollingDiv = div({ className: 'chatscroller', id: 'chatscroller' });
            new ResizeObserver(entries => {
                entries.forEach(entry => {
                    if (scrollingDiv.offsetHeight === 0) { return; }
                    console.log("Setting scroll to " + lastChatYPos);
                    scrollingDiv.scrollTo(0, scrollingDiv.scrollHeight - lastChatYPos - scrollingDiv.offsetHeight);
                })
            }).observe(scrollingDiv);


            scrollingDiv.onscroll = (event) => {
                lastChatYPos = scrollingDiv.scrollHeight - (scrollingDiv.scrollTop + scrollingDiv.offsetHeight);
                console.log("User Scrolled to 0");
            }

            var chatDiv = div({ className: 'chatroom' });

            if (!(currentView in messagelist)) {
                var divWaiting = div({ className: 'waitingonmessages' });
                divWaiting.innerText = "Loading Messages...";
                scrollingDiv.appendChild(divWaiting);
            } else {
                var list = Object.keys(messagelist[currentView]).sort(function (a, b) { return ((a * 1) - (b * 1)) })
                var onebefore = list[0] - 1;
                if (onebefore >= 0) {
                    var dudSegment = div({ className: 'messagesegment dudmessagesegment' });
                    dudSegment.innerText = 'loading more...';
                    scrollingDiv.appendChild(dudSegment);
                    new IntersectionObserver((entries, observer) => {
                        entries.forEach(entry => {
                            if (entry.intersectionRatio > 0) {
                                loadMoreText();
                            }
                        });
                    }, { root: scrollingDiv }).observe(dudSegment);
                }
                list.forEach(segmentkey => {
                    var segment = div({ className: 'messagesegment', id: 'messagesegment-' + segmentkey });

                    messagelist[currentView][segmentkey].forEach(message => {
                        var user = getUserByID(message.userid);
                        var username = user ? user.name : '[deleted user]';
                        var messageDiv = div({ className: 'message' });
                        var messageUserDiv = div({ className: 'messageuser' });
                        var messageMessageDiv = div({ className: 'messagemessage' });
                        messageUserDiv.innerText = username + ":";
                        if ('text' in message) {
                            messageMessageDiv.innerHTML = markupParser.makeHtml(message.text);
                        }
                        messageDiv.appendChild(messageUserDiv);
                        messageDiv.appendChild(messageMessageDiv);
                        segment.appendChild(messageDiv);
                        if ('url' in message) {
                            var urlElement = document.createElement('a');
                            urlElement.className = 'messageurl';
                            urlElement.setAttribute('href', message.url);
                            urlElement.innerText = message.url;
                            segment.appendChild(urlElement);
                        }
                        if ('img' in message) {
                            var imgElement = document.createElement('img');
                            imgElement.className = 'messageimg';
                            imgElement.setAttribute('height', message['height']);
                            imgElement.setAttribute('width', message['width']);
                            imgElement.src = message['img'];
                            segment.appendChild(imgElement);
                        }

                    });
                    //segment.innerHTML = markupParser.makeHtml(text);
                    scrollingDiv.appendChild(segment);
                });

            }
            chatDiv.appendChild(scrollingDiv);
            // Input Section
            if (cacheDragAndDropFile) {
                var outer = div({ className: 'chatroominputdraganddropouter' });
                var dragDropSection = div({ className: 'chatroominputdraganddrop' });
                var dragDropImage = document.createElement('img');
                var close = div({ className: 'chatroominputdraganddropclose' });
                dragDropImage.className = 'chatroominputdraganddropimg';
                chatDiv.appendChild(outer);
                outer.appendChild(dragDropSection);
                dragDropSection.appendChild(dragDropImage);
                dragDropSection.appendChild(close);
                close.onclick = () => { cacheDragAndDropFile = null; populateRoom(); };

                var reader = new FileReader();
                reader.onload = function (event) {
                    var result = event.target.result;
                    var split = result.split(',');
                    dragDropImage.src = result;
                };
                reader.readAsDataURL(cacheDragAndDropFile);
            }
            var input = document.createElement('form');
            var inputtext = document.createElement('textarea');
            var inputbutton = document.createElement('input');
            inputbutton.setAttribute('type', 'image');
            inputbutton.dataset.src = '/img/' + theme + "/send.png";
            inputbutton.src = '/img/' + theme + "/send.png";
            input.className = 'chatroominput';
            inputtext.classList = 'chatroominputtext';
            inputbutton.classList = 'chatroominputbutton';
            inputbutton.setAttribute('value', 'Send');
            inputtext.onkeypress = (event) => {
                var key = event.keyCode; // Yeah, I know
                if (key === 13) {
                    if (event.shiftKey) {
                        return;
                    }
                    event.preventDefault(null);
                    input.onsubmit();
                }
            }
            input.onsubmit = (event) => {
                if (event) { event.preventDefault(); }
                var text = inputtext.value;

                if (cacheDragAndDropFile) {
                    var reader = new FileReader();
                    reader.onload = function (event) {
                        // Result Preambles too much!
                        // Split it out
                        var result = event.target.result;
                        var split = result.split(',');
                        send({
                            type: 'message',
                            roomid: currentView,
                            message: { text },
                            filename: cacheDragAndDropFile.name,
                            rawfile: split[1]
                        })
                        cacheDragAndDropFile = null;
                        populateRoom();
                    };

                    reader.readAsDataURL(cacheDragAndDropFile);
                } else {
                    send({
                        type: 'message',
                        roomid: currentView,
                        message: { text }
                    })
                    inputtext.focus();
                }
                return false;
            };
            after = () => {
                inputtext.focus();
            }
            input.appendChild(inputtext);
            input.appendChild(inputbutton);
            chatDiv.appendChild(input);
            contents.appendChild(chatDiv);

        }
        el.appCoreView.innerText = '';
        el.appCoreView.appendChild(contents);
        if (after) { after(); }
    }

    const switchRoom = (roomid) => {
        if (currentView === roomid) { return; }
        // Close all opened connections
        Object.values(peerConnection).forEach((pc) => {
            pc.close();
        });
        // Change our view
        currentView = roomid;
        populateRoom();
        // Tell the server
        if (roomid) {
            send({
                type: 'joinroom',
                roomid
            });
        } else {
            send({ type: 'leaveroom' });
        }
    }

    loadMoreText = () => {
        var list = Object.keys(messagelist[currentView]).sort(function (a, b) { return ((a * 1) - (b * 1)) });
        var onebefore = list[0] - 1;
        if (onebefore >= 0) {
            send({ type: 'getmessages', roomid: currentView, segment: onebefore });
        }

        // If this was caused by putting scroll to top then reposition so we don't loop on it
        var chatscroller = document.querySelector('#chatscroller');
        if (chatscroller.scrollTop < 50) {
            chatscroller.scrollTop = 50;
        }

    }

    // Webcam RTC

    const createPeerConnection = (userid) => {
        if (!(userid in peerConnection)) {
            var pc = peerConnection[userid] = new RTCPeerConnection({
                bundlePolicy: 'max-bundle',
                iceServers: [
                    {
                        urls: ["stun:stun2.l.google.com:19302", "stun:stun3.l.google.com:19302"]
                    }
                ]
            });
            replacePeerMedia(pc);
            pc.onicecandidate = (event) => { handleIceCandidate(userid, event) };
            pc.ontrack = (event) => { handleTrack(userid, event) };
            pc.oniceconnectionstatechange = (event) => { handleIceStateChange(userid, event) };
            pc.onnegotiationneeded = async () => { console.log("RENEGOTIATE"); await pc.setLocalDescription(await pc.createOffer()); send({ type: 'video', touserid: userid, fromuserid: iam, payload: pc.localDescription }) }
        }
    }

    const handleIceStateChange = (userid, event) => {
        if (peerConnection[userid].iceConnectionState === 'failed') {
            restartStream(userid);
        }
    };

    const handleIceCandidate = (userid, event) => {
        if (event.candidate) {
            send({
                payload: event.candidate,
                type: 'video',
                fromuserid: iam,
                touserid: userid
            });
        } else {
        }

    }

    const restartStream = (userid) => {
        cleanupStream(userid);// Have you tried turning it off and on again
        send(
            {
                payload: { type: 'fuckoff' },
                type: 'video',
                fromuserid: iam,
                touserid: userid
            }
        );
        startCall(userid);
    }

    const handleTrack = (userid, event) => {
        var ele = document.getElementById('video-' + userid);
        var ele2 = document.getElementById('live-' + userid);

        var stream = event.streams[0];

        if (stream === remoteLiveStream[userid]) { return }
        if (stream === remoteWebcamStream[userid]) { return }

        if (ele && ele.srcObject === null) {
            // First stream from a user is webcam/audio
            console.log("Setting stream to conversation");
            remoteWebcamStream[userid] = stream;
            ele.srcObject = stream;
            //remoteWebcamStream[userid][0].onremovetrack = (track) => { ele.srcObject = null; };
            //remoteWebcamStream[userid][0].getVideoTracks()[0].onended = () => { console.log("VIDEO ENDED") };
        } else {
            // Second stream from a user is livestream. But probably just static
            console.log("Setting stream to livestream");
            remoteLiveStream[userid] = stream;
            if (ele2) {
                console.log("Putting in livestream webcam");
                ele2.srcObject = stream;
            }
        }
    }

    const cleanupStream = (userid) => {
        var ele = document.getElementById('video-' + userid);
        if (peerConnection[userid]) {
            var pc = peerConnection[userid];
            pc.ontrack = null;
            pc.onremovetrack = null;
            pc.onicecandidate = null;
            pc.oniceconnectionstatechange = null;
            pc.onconnectionstatechange = null;
            pc.close();
        }
        if (ele && ele.srcObject) {
            ele.srcObject.getTracks().forEach(track => track.stop());
        }

        delete peerConnection[userid];
        delete remoteWebcamStream[userid];
    }

    const startCall = (userid) => {
        // Awful race condition if both ends attempt to call at the same time
        // Only one needs to call and we have unique IDs!
        if (iam < userid) {
            send({ type: 'video', payload: { type: 'callme' }, touserid: userid, fromuserid: iam });
            return;
        }
        if (userid in peerConnection) {
            return;
        }
        createPeerConnection(userid);
        peerConnection[userid].createOffer((sD) => {
            peerConnection[userid].setLocalDescription(sD);
            console.log("Sending Offer");
            send({
                payload: sD,
                type: 'video',
                fromuserid: iam,
                touserid: userid
            });
        }, (error) => {
            console.log(error);
        })
    }
    function whiteNoise() {
        var width = 50;
        var height = 25;
        const canvas = Object.assign(document.createElement("canvas"), { width, height });
        const ctx = canvas.getContext('2d');
        ctx.fillRect(0, 0, width, height);
        const p = ctx.getImageData(0, 0, width, height);
        requestAnimationFrame(function draw() {
            for (var i = 0; i < p.data.length; i++) {
                p.data[i++] = p.data[i++] = p.data[i++] = Math.random() * 255;
            }
            ctx.putImageData(p, 0, 0);
            requestAnimationFrame(draw);
        });
        return canvas.captureStream();
    }

    startLocalDevices = () => {
        if (localWebcamStream) {
            localWebcamStream.getTracks().forEach(track => track.stop());
        }
        var ele = document.getElementById('video-' + iam);
        navigator.mediaDevices
            .getUserMedia(createConstraints())
            .then(stream => {
                if (ele) {
                    ele.srcObject = null;
                    ele.srcObject = stream;
                }
                localWebcamStream = stream;
                if (isMute) {
                    localWebcamStream.getAudioTracks().forEach((audio) => {
                        audio.enabled = !isMute;
                    });
                }
                if (!isWebcam) {
                    localWebcamStream.getVideoTracks().forEach((video) => {
                        video.enabled = isWebcam;
                    });
                }

                // Any existing PC need the stream
                replaceAllPeerMedia();
                return navigator.mediaDevices.enumerateDevices();
            })
            .then(updateInputsInSettings)
            .catch(err => {
                console.error("error:" + err);
                // Put 'Any' back in. At this point we've lost our custom device list
                updateInputsInSettings(null);
            });
    }

    const replaceAllPeerMedia = () => {
        Object.values(peerConnection).forEach((pc) => {
            replacePeerMedia(pc);
        });
    }

    const replacePeerMedia = (pc) => {
        if (pc.getSenders().length === 3) {
            if (localWebcamStream) {
                pc.getSenders()[0].replaceTrack(localWebcamStream.getVideoTracks()[0]);
                pc.getSenders()[1].replaceTrack(localWebcamStream.getAudioTracks()[0]);
            }
            if (localLiveStream) {
                pc.getSenders()[2].replaceTrack(localLiveStream.getVideoTracks()[0]);
            }
        } else {
            if (localWebcamStream) {
                pc.addTrack(localWebcamStream.getVideoTracks()[0], localWebcamStream);
                pc.addTrack(localWebcamStream.getAudioTracks()[0], localWebcamStream);
            } else {
                console.log("Damnit Craig");
            }
            if (localLiveStream) {
                pc.addTrack(localLiveStream.getVideoTracks()[0], localLiveStream);
            } else {
                var whiteNoiseStream = whiteNoise();
                console.log(whiteNoiseStream);
                pc.addTrack(whiteNoiseStream.getTracks()[0], whiteNoiseStream);
            }
        }

        console.log(pc);
        console.log(pc.getSenders());
    }

    const toggleWebcam = () => {
        isWebcam = !isWebcam;
        changeImg(el.toggleWebcam, isWebcam ? 'webcamon.png' : 'webcamoff.png');
        if (localWebcamStream) {
            localWebcamStream.getVideoTracks().forEach((video) => {
                video.enabled = isWebcam;
            });
        }
    }
    const toggleScreenShare = () => {
        if (isScreenShare) {
            send({ type: 'golive', livestate: false, livelabel: '' });
            isScreenShare = false;
            replaceAllPeerMedia();
            localLiveStream = null;
        } else {
            selectScreenShare();
        }
    }
    const selectScreenShare = () => {
        // TODO In-app choice of windows?

        navigator.mediaDevices
            .getDisplayMedia(createScreenConstraints())
            .then(stream => {
                localLiveStream = stream;
                console.log("Started Streaming window : " + stream.getVideoTracks()[0].label);
                console.log(stream);
                console.log(stream.getTracks())
                replaceAllPeerMedia();
                send({ type: 'golive', livestate: true, livelabel: stream.getTracks()[0].label });
                isScreenShare = true;
            })
            .catch(err => {
                console.error("error:", err);
            });
    };
    const toggleMuted = () => {
        if (localWebcamStream) {
            isMute = !isMute
            changeImg(el.toggleMute, isMute ? 'micoff.png' : 'micon.png');
            localWebcamStream.getAudioTracks().forEach((audio) => {
                audio.enabled = !isMute;
            });
        }
    }

    const createAudioConstraints = () => {
        var deviceId = getConfig('microphonedevice', 'none');
        deviceId = (deviceId === 'undefined') ? 'none' : deviceId;
        deviceId = (deviceId !== 'none') ? { exact: deviceId } : undefined;
        // TODO User settings
        return {
            sampleSize: 16,
            channelCount: 1,
            echoCancellation: getConfig('echocancel'),
            noiseSuppression: getConfig('noisesupress'),
            sampleRate: 96000, // 24k - 96k
            deviceId
        };
    }
    const createVideoConstraints = () => {
        var deviceId = getConfig('cameradevice', 'none');
        deviceId = (deviceId === 'undefined') ? 'none' : deviceId;
        deviceId = (deviceId !== 'none') ? { exact: deviceId } : undefined;
        // TODO User settings
        return {
            width: { min: 640, ideal: 1280 },
            height: { min: 400, ideal: 720 },
            framerate: 30,
            deviceId
        };
    }
    const createConstraints = () => {
        var constraints = {
            video: createVideoConstraints(),
            audio: createAudioConstraints()
        };
        return constraints;
    }
    const createScreenConstraints = () => {
        // TODO Base on user settings
        return {
            video: {
                cursor: 'motion',
                framerate: 30,
                height: 1080,
            }/*,
            audio: {
                sampleSize: 16,
                channelCount: 2,
            }*/
        };
    }

    const changeImg = (img, src) => {
        img.src = 'img/' + theme + '/' + src;
        img.dataset.src = src;
    }

    changeFont = (fontName) => {
        console.log("Changing to font " + fontName);
        font = fontName;
        if (fontName) {
            el.app.style = 'font-family: ' + fontName;
        } else {
            el.app.style = '';
        }

    }

    changeTheme = (themeName) => {
        // Change CSS
        theme = themeName;
        var oldlinks = document.getElementsByTagName('link');
        var head = document.getElementsByTagName('head')[0];
        Object.values(oldlinks).forEach(link => {
            head.removeChild(link);
        });

        var newlink = document.createElement('link');
        newlink.setAttribute('rel', 'stylesheet');
        newlink.setAttribute('type', 'text/css');
        newlink.setAttribute('href', 'css/' + themeName + '.css');
        head.appendChild(newlink);

        // Change IMGs!
        var oldimg = document.getElementsByTagName('img');
        Object.values(oldimg).forEach(img => {
            img.src = 'img/' + theme + '/' + img.dataset.src;
        });
        // And... Image inputs?
        var oldimg = document.getElementsByTagName('input');
        Object.values(oldimg).forEach(img => {
            if (img.getAttribute('type') === 'image') {
                img.src = 'img/' + theme + '/' + img.dataset.src;
            }
        });

    }


    const dragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.app.classList.add('draganddrop');
    }
    const dragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.app.classList.add('draganddrop');
    }
    const dragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.app.classList.remove('draganddrop');
    }
    const dragDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer && e.dataTransfer.files) {

            // User upload
            if (currentView) {
                var file = e.dataTransfer.files[0]
                cacheDragAndDropFile = file;
                populateRoom();
            }

            return false;
        }

        return false;
    }
    playToGroup = (videoUrl) => {
        send({ type: 'groupplay', 'url': videoUrl });
    }

    // Prepare callbacks 

    el.login.onsubmit = (e) => {
        e.preventDefault();
        processLogin();
        return false;
    }
    el.inviteuserform.onsubmit = (e) => {
        e.preventDefault();
        var group = el.inviteusergroup.value;
        if (group) {
            send({ type: 'invite', groupName: group })
        } else {
            el.inviteuserreply.innerText = 'Choose a group to create invite for';
        }
        return false;
    }
    el.toggleWebcam.onclick = () => toggleWebcam();
    el.toggleScreenShare.onclick = () => toggleScreenShare();
    el.toggleMute.onclick = () => toggleMuted();
    el.hangup.onclick = () => switchRoom(null);
    el.app.addEventListener('dragenter', dragEnter, false);
    el.app.addEventListener('dragover', dragOver, false);
    el.app.addEventListener('dragleave', dragLeave, false);
    el.app.addEventListener('drop', dragDrop, false)

    // Connect to WS
    connect();

    markupParser = new showdown.Converter();
    updatePerms();
    changeTheme(theme);
    changeFont(font);

    signUpCode = window.location.search
    signUpCode = signUpCode.replace(/\?/g, '');

    if (signUpCode) {
        // New user?
        showLoginWithSignUp();
    } else {
        // Straight to login page!
        showLogin();

    }
});