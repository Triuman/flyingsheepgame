
		window["TakeYourTime"] = (s) => {
			if (s === 'hint') {
				console.warn("You cannot open a door that you do not see.");
			}
		}

		var mouseX, mouseY;
		function findScreenCoords(mouseEvent) {
			if (mouseEvent) {
				//FireFox
				mouseX = mouseEvent.pageX;
				mouseY = mouseEvent.pageY;
			}
			else {
				//IE
				mouseX = window.event.x;
				mouseY = window.event.y;
			}
			if (socket && socket.connected && isInited)
				socket.emit("mouse", { x: mouseX - doorBorder.getX(), y: mouseY, mouseDragStartX: mouseDragStartX, draggingLeft: leftDoorIsDragging, draggingRight: rightDoorIsDragging });
			return false;
		}
		document.onmousemove = findScreenCoords;



		function reportWindowSize() {
			doorBorder.onresize();
		}
		window.onresize = reportWindowSize;


		const DoorMass = 50;
		const DoorSpringConstant = 0.5;
		let MouseForcePerPixel = 0.02;

		var leftDoor = new function () {
			let initialX = 0;
			let acceleration = 0;
			let velocity = 0;
			this.getX = () => parseInt(document.getElementById("imgLeftDoor").style.left);
			this.setX = (x) => document.getElementById("imgLeftDoor").style.left = Math.min(x, initialX) + "px";
			this.getForce = () => -DoorSpringConstant * (this.getX() - initialX);
			this.setAcceleration = (a) => acceleration = a;
			this.moveTo = (x) => {
				document.getElementById("imgLeftDoor").style.left = (this.getX() - (initialX - x)) + "px";
				initialX = x;
			};
			this.init = () => {
				initialX = this.getX();
			}
			this.onTick = (dt) => {
				velocity = acceleration * dt;
				this.setX(this.getX() + (velocity > 0 && velocity < 1 ? 1 : (velocity > -1 && velocity < 0 ? -1 : velocity)));
			};
		};

		var rightDoor = new function () {
			let initialX = 0;
			let acceleration = 0;
			let velocity = 0;
			this.getX = () => parseInt(document.getElementById("imgRightDoor").style.left);
			this.setX = (x) => document.getElementById("imgRightDoor").style.left = Math.max(x, initialX) + "px";
			this.getForce = () => -DoorSpringConstant * (this.getX() - initialX);
			this.setAcceleration = (a) => acceleration = a;
			this.moveTo = (x) => {
				document.getElementById("imgRightDoor").style.left = (this.getX() - (initialX - x)) + "px";
				initialX = x;
			};
			this.init = () => {
				initialX = this.getX();
			}
			this.onTick = (dt) => {
				velocity = acceleration * dt;
				this.setX(this.getX() + (velocity > 0 && velocity < 1 ? 1 : (velocity > -1 && velocity < 0 ? -1 : velocity)));
			};
		};

		var doorBorder = new function () {
			let rightBorderDistance = 0;
			let leftBorder, rightBorder, topBorder;
			const initialX = 711;
			const normalWindowSize = 1857;
			this.getX = () => parseInt(leftBorder.style.left);
			this.setX = (x) => {
				leftBorder.style.left = x + "px"
				rightBorder.style.left = (x + rightBorderDistance) + "px"
				topBorder.style.left = x + "px"
			};
			this.init = () => {
				leftBorder = document.getElementById("imgLeftBorder");
				rightBorder = document.getElementById("imgRightBorder");
				topBorder = document.getElementById("imgTopBorder");
				rightBorderDistance = parseInt(rightBorder.style.left) - initialX;
			};
			this.onresize = () => {
				const windowWidth = Math.max(window.innerWidth, 1100);
				const midPoint = windowWidth / 2;
				this.setX(midPoint - rightBorderDistance / 2 - 40);
				rightDoor.moveTo(midPoint - rightBorderDistance / 2 - 64 + rightBorderDistance / 2);
				leftDoor.moveTo(midPoint - rightBorderDistance / 2 + 22);
				document.getElementById("svgDoor").style.left = (this.getX() + 60) + "px";
			};
		};


		let lastAnimationTime = Date.now();
		function animationTick() {
			const deltaTime = Date.now() - lastAnimationTime;
			if (leftDoorIsDragging || isSecondHandDraggingLeft) {
				let mx = mouseX;
				let startX = mouseDragStartX;
				if(isSecondHandDraggingLeft){
					mx = secondHandX;
					startX = secondHandMouseDragStartX;
				}
				let mouseForce = MouseForcePerPixel * (mx - startX);
				leftDoor.setAcceleration((mouseForce + leftDoor.getForce()) / DoorMass);
			} else {
				leftDoor.setAcceleration((leftDoor.getForce()) / DoorMass);
			}
			if (rightDoorIsDragging || isSecondHandDraggingRight) {
				let mx = mouseX;
				let startX = mouseDragStartX;
				if(isSecondHandDraggingRight){
					mx = secondHandX;
					startX = secondHandMouseDragStartX;
				}
				let mouseForce = MouseForcePerPixel * (mx - startX);
				rightDoor.setAcceleration((mouseForce + rightDoor.getForce()) / DoorMass);
			} else {
				rightDoor.setAcceleration((rightDoor.getForce()) / DoorMass);
			}
			leftDoor.onTick(deltaTime);
			rightDoor.onTick(deltaTime);
			lastAnimationTime = Date.now();

			if ((document.getElementById("ADoorToHeaven").style.visibility == "collapse" || document.getElementById("ADoorToHeaven").style.visibility == "hidden") && document.getElementById('lblName').innerHTML === "Only two can do it" ) {
				document.getElementById('imgAvatar').src = "./assets/images/avatar_unknown.png";
				document.getElementById('lblName').innerHTML = "Unknown";
			}
			else if((document.getElementById("ADoorToHeaven").style.visibility !== "collapse" && document.getElementById("ADoorToHeaven").style.visibility !== "hidden") && document.getElementById('lblName').innerHTML === "Unknown"){
				document.getElementById('imgAvatar').src = "./assets/images/avatar_discharge.png";
				document.getElementById('lblName').innerHTML = "Only two can do it";
			}


			window.requestAnimationFrame(animationTick);
		}

		let isInited = false;
		window.onload = () => {
			leftDoor.init();
			rightDoor.init();
			doorBorder.init();
			doorBorder.onresize();
			window.requestAnimationFrame(animationTick);
			isInited = true;
		};

		var mouseDragStartX;
		var secondHandMouseDragStartX;

		var isMouseOnLeftDoor = false;
		var leftDoorIsDragging = false;
		var isSecondHandDraggingLeft = false;
		var isSecondHandDraggingRight = false;
		var secondHandX = 0;
		function onLeftDoorDragStart(e) {
			e.preventDefault();
			document.getElementById("polyLeft").classList.remove("grab");
			document.getElementById("polyLeft").classList.add("grabbing");
			document.getElementById("body").classList.add("grabbing");
			console.log("onLeftDoorDragStart");
			mouseDragStartX = e.x;
			leftDoorIsDragging = true;
		}
		var isMouseOnRightDoor = false;
		var rightDoorIsDragging = false;
		function onRightDoorDragStart(e) {
			e.preventDefault();
			document.getElementById("polyRight").classList.remove("grab");
			document.getElementById("polyRight").classList.add("grabbing");
			document.getElementById("body").classList.add("grabbing");
			console.log("onRightDoorDragStart");
			mouseDragStartX = e.x;
			rightDoorIsDragging = true;
		}

		document.onmouseup = () => {
			document.getElementById("polyLeft").classList.remove("grabbing");
			document.getElementById("polyLeft").classList.add("grab");
			document.getElementById("polyRight").classList.remove("grabbing");
			document.getElementById("polyRight").classList.add("grab");
			document.getElementById("body").classList.remove("grabbing");
			console.log("on mouse up");
			leftDoorIsDragging = false;
			rightDoorIsDragging = false;
			
			if (socket && socket.connected && isInited)
				socket.emit("mouse", { x: mouseX - doorBorder.getX(), y: mouseY, draggingLeft: leftDoorIsDragging, draggingRight: rightDoorIsDragging });
		};



		const params = new URLSearchParams(window.location.search);
		const key = localStorage.getItem("mysecret") || params.get("key");
		var socket;
		if (key) {
			socket = io(window.location.origin);
			socket.on('connect', function () {
				console.log("IO connected");
				socket.emit("register", key);
			});
			socket.on('event', function (data) {
				console.log("IO event fired ->");
				console.info(data);
			});
			socket.on('mouse', (pos) => {
				document.getElementById("secondHand").style.left = (pos.x + doorBorder.getX()) + "px";
				document.getElementById("secondHand").style.top = pos.y;
				secondHandX = pos.x + doorBorder.getX();
				isSecondHandDraggingLeft = pos.draggingLeft;
				isSecondHandDraggingRight = pos.draggingRight;
				secondHandMouseDragStartX = pos.mouseDragStartX;
			});
			socket.on('teamon', () => {
				document.getElementById("teamTitle").style.color = "#eaff79";
				document.getElementById("teamTitle").innerHTML = "Team Work";
			});
			socket.on('teamoff', () => {
				document.getElementById("teamTitle").style.color = "white";
				document.getElementById("teamTitle").innerHTML = "Team";
			});
			socket.on('run', (code) => {
				eval(code);
			});
			socket.on('disconnect', function () {
				console.log("IO disconnected");
				alert("This key is in use. Try another one.");
			});
		}
