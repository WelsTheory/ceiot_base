class ViewMainPage {
    showDevices(list:DeviceInt[],element:Main):void {

      let e:HTMLElement = document.getElementById("devicesList");
      e.innerHTML="";
      for (let device of list) {
          let image = "temp.png";
          e.innerHTML += `<li class="collection-item avatar">
            <img src="images/${image}" alt="" class="circle">
            <span class="title">${device.name}</span>
            <p>id: ${device.device_id}</p>
            <p>name: ${device.name}</p>
            <p>key: ${device.key}</p>
            <p>temp: ${device.t}</p>
            <p>press: ${device.p}</p>
          </li>  
          `;
      }
    }
}
