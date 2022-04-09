var startIcon = null, finishIcon = null;

function loadMap() {
  var map = L.map('map').setView([45.182471, 5.725589], 13);

  var mapbox = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1
  }).addTo(map);
  var opentopomap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  }).addTo(map);

  var baseMaps = {};
  baseMaps["MapBox"] = mapbox;
  baseMaps["Topo"] = opentopomap;
  L.control.layers(baseMaps).addTo(map);

  L.Control.DlIGC = L.Control.extend({
    onAdd: function(map) {
      var btn = L.DomUtil.create('button');
      btn.id = "btnDlTrace";
      btn.title = "Download GPX";
      btn.style.display = 'none';
      btn.innerHTML = '<?xml version="1.0" encoding="iso-8859-1"?><svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="32px" height="32px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><g><path d="M382.56,233.376C379.968,227.648,374.272,224,368,224h-64V16c0-8.832-7.168-16-16-16h-64c-8.832,0-16,7.168-16,16v208h-64 		c-6.272,0-11.968,3.68-14.56,9.376c-2.624,5.728-1.6,12.416,2.528,17.152l112,128c3.04,3.488,7.424,5.472,12.032,5.472 		c4.608,0,8.992-2.016,12.032-5.472l112-128C384.192,245.824,385.152,239.104,382.56,233.376z"/></g><g><path d="M432,352v96H80v-96H16v128c0,17.696,14.336,32,32,32h416c17.696,0,32-14.304,32-32V352H432z"/></g></svg>';
      btn.onclick = download;

      return btn;
    },
    onRemove: function(map) {}
  });
  new L.Control.DlIGC({ position: 'topright' }).addTo(map);

  var LeafIcon = L.Icon.extend({
    options: {
      iconAnchor:   [12, 40], // point of the icon which will correspond to marker's location
      popupAnchor:  [1,-33] // point from which the popup should open relative to the iconAnchor
    }
  });
  startIcon = new LeafIcon({ iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAMAAAD3TXL8AAADAFBMVEX///+92pWRv06CtjiKu0GNvUePv0u52JCGuD2TxEyazFCj1Vqm11+k1FyczlKTxky/2Zqbw2Ce0Vag01Sd0lCb0UuZ0Eig0FiYw1yEtTyTxEue01KY0EiY0EeGtUKYy1Ch1ViZ0UmX0EWEtT+kyHKPvkqg1FiVz0WVz0SQwUufxWqEskCf01eX0UiUz0Kf1VWEs0B/rz2Wyk6b006Tz0GMvEiAsDt7rDWKukec0FSc01GCsECSzz+Y0kp+rTusyoG0z42Z0kyLuEaRzj2d01SEskGBrj6ixHOMwESQzjyRxUqKtFCTuV6OwUeDsEeUykuT0EOOzjqW0kmKvUOtyYW50ZeHuEN8qT2Rz0CNzTm1zZCFtEOX0kp+qj6XumSMzTeStl6dvW6IvEKU0UW4z5WFtkGV0UeLzTaWz0x5pTh3pDeUzUuFt0G6z5h9qj+KzDR2ojd4pTp9qz9ynDKVz0qLzTiIzDOJzTWOxkVxnDGCqklynjOLw0NxnjOOslyFuz6Q0ECHzDGHzDKO0D6Ry0eP0ECGvT93pTmU0kiGzDCJzjaMzzt3pDh3oDyKw0CMzjmFyy56okCyyZKR0UKEyyyS0UR8rDxymzSKx0CCyyuIxT6uxo2ByimCyit6qjuHxDyHzjSAyihznji1ypV5qjp/yiZ4pzmFwjqFzTJ+yiV2njmLzzx8ySOBvzeEzjF7ySJ4oTyKzzp8yiN6ySCAvTWDzC95yB91oziIzjh4yR17pER9uzKAzCx2yBuBzC19pUVzoTaFzjV0yBmAp0l7uDF/zCp6tzGDzDNynTWEqk+AyDCJrVZwoC9sly4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBAAAAAAAAAABRzXhRzXgAAZAAAAAAAAAAAAAAAAAAAAEAAABRzZxRzZwAAWwAAABRzaxRzawAACQAAAAAAAAAAAAAAAAAAAAAADQAABNBfMAAAAAAAABRzeBRzeAAAFgAAAAAAAAAAAAAAAAAAAAAAABeeXwRAAAAAXRSTlMAQObYZgAAAAlwSFlzAAALEgAACxIB0t1+/AAAAi1JREFUeNpjYCAIGJmYWVhZmNnY0SU4OLm4eXh4ePn4OQSQxQVZhbiFRUTFREWEucVZJRASklK80jKyUCDNyykJk5CTV1BUQgBFBS5liISKqpq6Bgioy0BpNU0tsIy2jq4eECjqK+go6CuCmLo6BiAJQyNjEyAwFjI1MzezsLQCc4wMgTLW+jZAYCtvZw/kONgZOYK4+tZAjpOxs7OziYsr1Dlu0npAvrETA4O7h66np6eSlzdUxscXxNf1cGfw8w8IDAwMCg6ByoSG2QL5Af5+DOH+EZGRkUFhUTDfRccA+RH+sQxxHgHx8fEBHglQicSkZDA/jiElNS09PT0wIxMqk5XtDOSn5eQyMOTF5ANBgEcBWKIwOBnEjSkCsotLSsvKysrTKgorq6oLaoLKgbzSklqgTF19QyMQNDUHtdS0BLU2gTgNbXUgA9o7mjrBoKu7C8Jq6ugBG93b1z8BFfT3TQTLTDKcPAUFTJg6DerQ6TO6ZiKDrlnToTKzp7XOQQJzW+dNggXI9PkLFiJA+fxF8BSyeEnzwqUwsLB5GVKqWrR8xUoYWLB8FXKCW7Z65RoIWLm6HSWJ9q5dtx4CVqzdgJp62zdu2gwCmzb2oKXriVu2bgOBrVsmoif57Ts279y5c/OO7Ri5ZNfuPXv37t23ez9mBjpwcOehnQcPYMlah48cPXT02GFsue7A8c3HT2CTYDh5bN2xk1hlGE6cwq6FgeH0mdM4ZBjOMhAFAFCC73+a/8WMAAAAAElFTkSuQmCC' });
  finishIcon = new LeafIcon({ iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAMAAAD3TXL8AAADAFBMVEX////alpa/T0+2OTm7QkK9SEi/TEzYkJC4Pj7ETU3MUFDVW1vXYGDUXV3OU1PGTU3DYWHRV1fTVVXSUVHRTEzQSUnQWVnDXV21PT3ETEzTU1PQSEi1Q0PLUVHVWVnRSkrQRka1QEDIc3O+S0vUWVnPRUXBTEzFa2uyQUHTWFjRSUnPQ0PVVlazQUGvPj7KT0/TT0/PQkK8SUmwPDysNja6SEjQVVXTUlKwQUHPQEDSS0utPDzKgoLPjo7STU24R0fOPj6yQkKuPz/EdHTARUXOPT3FS0u0UVG5X1/BSEiwSEjKTEzQRETOOzvSSkq9RETJhobRmJi4RESpPj7PQUHNOjrNkZG0RESqPj66ZWXNODi2X1+9b2+8Q0PRRkbPlpa2QkLRSEjNNzfPTU2lOTmkODjNTEy3QkLPmZmqQEDMNDSiODilOzurQECcMzPPS0vNOTnNNjbGRkacMjKqSkqeNDTDRESyXV27Pz/QQUHMMjLMMzPQPz/LSEi9Pz+lOjrSSUnMMDDONzfPPDykOTmgPT3DQUHOOjrLLy+iQUHJk5PRQ0PLLS3RRUWsPT2bNTXHQUHLLCzFPz/Gjo7KKirKLCyqPDzEPT3ONTXKKSmeOTnKlpaqOjrKJyenOjrCOzvNMzPKJiaeOjrPPT3JJCS/ODjOMjLJIyOhPT3POzvKJCTJISG9NjbIICCjOTnOOTnJHh6kRUW7MzPMLCzIHBzMLi6lRkahNzfONjbIGhqnSkq4MjLMKyu3MjKdNjaqUFDIMTGtV1egMDCXLy8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABRnAhRt0wAACQAAQAAAAAAAAAAAAAAAAAAAGgAABNBfMAAAAAAAABSSsBSSsAAAPQAEAAAAAAAAAAAAAAAAAAAAABRpXRSRWgAANAAAABSSvRSSvQAAFgAABAAAAAAAAAAAAAAAAAAAABSQpBSRgQAADQAAABRdmhRnAgAACQAAAAAAAC1YygHAAAAAXRSTlMAQObYZgAAAAlwSFlzAAALEgAACxIB0t1+/AAAAidJREFUeNpjYCAIGJmYWVhZmNnY0SU4OLm4eXh4ePn4OVDEBVgFuYWERURFhIW4xVjFERISkrxSotJQIMXLKQGTkJGVk1dAAHk5LkWIhJKyiioEiEJpFTV1sIyGppY2EMjryGnK6ciDmFqauiAJPX0DQyAwEDQyNjE2NTMHc/T1gDIWOpZAYCVrbQPk2Frr24G4OhZAjr2Bg4ODoZAj1DlOUtpAvoE9A4Ozi5arq6uCmztUxsMTxNdycWbw8vbx9fX18w+AygQGWQH5Pt5eDMHeIaGhoX5BYTDfhVsB+SHeEQyRLj5RUVE+LtFQiZjYODA/kiE+ITEpKck3OQUqk5rmAOQnpmcwMGRaZQGBj0s2WCLHPw7EtcoFsvPyC4DMwsSinOKS0uwyv0IgryC/FChTXlFZBQTVNX61ZbV+ldUgTmVdOciA+obqRjBoam6CsKobWsBGt7a1d6CC9rZOsEyXXncPCujo7YM6tH9C00Rk0DSpHyozua9yChKYWjmtCxYg/dNnzESAwumz4Clk9pyamXNhYGbNPKRUNWv+goUwMGP+IuQEN2/xwiUQsHBxPUpSbF26bDkELFi6AjX11q9ctRoEVq1sQUvXnWsa14JA45pO9CS/bv3qDRs2rF6/DiOXbNy0ecuWLVs3bcPMQNt3bNi5Ycd2LFlr1+49O/fs3YUt123PWp21D5sEw/69y/buxyrDsO8Adi0MDAcPHcQhw3CYgSgAAIO44YJQe27SAAAAAElFTkSuQmCC' });

  return map;
}
