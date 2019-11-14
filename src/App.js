import React, { Component } from 'react';
import DragFiles from './components/DragFiles';
import JSZip from 'jszip';
import toGeoJSON from 'togeojson';

class App extends Component {

  componentDidMount(){
    // var s = document.createElement('script');
    // s.type = 'text/javascript';
    // s.src = `https://cdnjs.cloudflare.com/ajax/libs/jszip/3.2.2/jszip.js`;
    // var x = document.getElementsByTagName('script')[0];
    // x.parentNode.insertBefore(s, x);
    // // s.addEventListener('load', e => {
    // //   this.onScriptLoad()
    // // })

    // var s2 = document.createElement('script');
    // s2.type = 'text/javascript';
    // s2.src = `https://cdnjs.cloudflare.com/ajax/libs/togeojson/0.16.0/togeojson.js`;
    // var x2 = document.getElementsByTagName('script')[0];
    // x2.parentNode.insertBefore(s2, x2);
    // s2.addEventListener('load', e => {
    //   this.convertKMZ()
    // })
      
    // const script1 = document.createElement("script");

    // script1.src = "";
    // // script1.async = true;

    // document.body.appendChild(script1);

    // const script2 = document.createElement("script");

    // script2.src = ""

    // document.body.appendChild(script2);

    // this.convertKMZ();


  }


  render(){
    return (
      <DragFiles
        setFile={(file)=>{
        console.log (file[0]);

        let getDom = xml => (new DOMParser()).parseFromString(xml, "text/xml")
        let getExtension = fileName => fileName.split(".").pop()
    
        let getKmlDom = (kmzFile) => {
            var zip = new JSZip()
            return zip.loadAsync(kmzFile)
                .then(zip => {
                    let kmlDom = null
                    zip.forEach((relPath, file) => {
                        if (getExtension(relPath) === "kml" && kmlDom === null) {
                            kmlDom = file.async("string").then(getDom)
                        }
                    })
                    return kmlDom || Promise.reject("No kml file found")
                });
        }
        var f = file[0]

        let geoJson = getKmlDom(f).then(kmlDom => {
          let geoJsonObject = toGeoJSON.kml(kmlDom)
          return JSON.stringify(geoJsonObject)
      })
      geoJson.then(gj => document.getElementById("output").innerText = gj)

        // f.addEventListener("change", e => {
        //     let geoJson = getKmlDom(e.target.files[0]).then(kmlDom => {
        //         let geoJsonObject = toGeoJSON.kml(kmlDom)
        //         return JSON.stringify(geoJsonObject)
        //     })
        //     geoJson.then(gj => document.getElementById("output").innerText = gj)
        // })


        }}>
        <div>
          <h1>Hello world</h1>
          <input type="file" id="f" />
          <textarea id="output" rows="20" cols="70"></textarea>
        </div>
      </DragFiles>
    );
  }
}

export default App;
