
  export default function saveCsv({captureData, captureConfig}) {

    const downloadTxtFile = () => {

    let csv = [];
    for (let i = 0; i < captureConfig.captureDepth; i++) {
        for (let channel = 0; channel < 3; channel++) {
            if (captureConfig.activeChannels[channel]) {
                csv.push(String(captureData[channel][i] * 3.3 / 4095));
                csv.push(",**");
            }

        }
        csv.push("\n");
    }

    // Remove trailing comma
    csv.pop();
    csv.pop();
    csv.push("\n");

    // file object
     const file = new Blob(csv, {type: 'text/plain'});
 

     
    // anchor link
     const element = document.createElement("a");
     element.href = URL.createObjectURL(file);
     element.download = "capture.csv";
 
     // simulate link click
     document.body.appendChild(element); // Required for this to work in FireFox
     element.click();
  }
    return (
        <button id="downloadBtn" onClick={downloadTxtFile} value="download">Save capture</button>
    );
  }