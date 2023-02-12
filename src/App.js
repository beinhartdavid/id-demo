import React, { useState, useEffect, Fragment } from "react";
import * as tf from "@tensorflow/tfjs";
import { DropzoneArea } from "material-ui-dropzone";
import { Backdrop, Chip, CircularProgress, Grid, Stack } from "@mui/material";

function App() {
  const [model, setModel] = useState(null);
  const [classLabels, setClassLabels] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confidence, setConfidence] = useState(null);
  const [predictedClass, setPredictedClass] = useState(null);
  const [classification, setClassification] = useState(null);
  const [description, setDescription] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  

  useEffect(() => {
    const loadModel = async () => {
      //const model_url = "tfjs/MobileNetV3Large/model.json";

      //const model = await tf.loadGraphModel(model_url);
      const model = await tf.loadLayersModel("https://raw.githubusercontent.com/beinhartdavid/tfjs-model/master/model.json")

      setModel(model);
    };

    const getClassLabels = async () => {
      const res = await fetch(
        "https://raw.githubusercontent.com/anishathalye/imagenet-simple-labels/master/imagenet-simple-labels.json"
      );

      const data = await res.json();

      setClassLabels(data);
    };

    loadModel();
    getClassLabels();
  }, []);

  const readImageFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);

      reader.readAsDataURL(file);
    });
  };

  const createHTMLImageElement = (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => resolve(img);

      img.src = imageSrc;
    });
  };

  const handleImageChange = async (files) => {
    if (files.length === 0) {
      setConfidence(null);
      setPredictedClass(null);
      setClassification(null);
      setDescription(null);
      setImageURL(null);
    }

    if (files.length === 1) {
      setLoading(true);

      const imageSrc = await readImageFile(files[0]);
      const image = await createHTMLImageElement(imageSrc);

      // tf.tidy for automatic memory cleanup
      const [predictedClass, confidence] = tf.tidy(() => {
        const tensorImg = tf.browser.fromPixels(image).resizeNearestNeighbor([224, 224]).toFloat().expandDims();
        const result = model.predict(tensorImg);
        console.log(result)
        console.log("result")

        const predictions = result.dataSync();
        
       
        const predicted_index = result.as1D().argMax().dataSync()[0];
        console.log(predicted_index)
       
        const predictedClass = classLabels[predicted_index];
       
        const confidence = Math.round(predictions[predicted_index] * 100);

        return [predictedClass, confidence];
      });

      setPredictedClass(predictedClass);

      if (confidence ==100){
        setClassification("SR-71 Blackbird")
        setDescription("'No reconnaissance aircraft in history has operated globally in more hostile airspace or with such complete impunity than the SR-71, the world's fastest jet-propelled aircraft. The Blackbird's performance and operational achievements placed it at the pinnacle of aviation technology developments during the Cold War.This Blackbird accrued about 2,800 hours of flight time during 24 years of active service with the U.S. Air Force. On its last flight, March 6, 1990, Lt. Col. Ed Yeilding and Lt. Col. Joseph Vida set a speed record by flying from Los Angeles to Washington, D.C., in 1 hour, 4 minutes, and 20 seconds, averaging 3,418 kilometers (2,124 miles) per hour. At the flight's conclusion, they landed at Washington-Dulles International Airport and turned the airplane over to the Smithsonian.'")
        setImageURL("https://ids.si.edu/ids/deliveryService?id=NASM-SI-2006-2744&max=900")
      } 
      else{
        setClassification("UFO!")
        setDescription("We're working to add more exibits to this app each day, for now it appears to be a UFO! Learn more about this project here")
        setImageURL("https://img.freepik.com/free-vector/sticker-template-with-unidentified-flying-object-ufo-isolated_1308-66111.jpg?w=1480&t=st=1676230027~exp=1676230627~hmac=284ce2f0378f9fe81e5d79b7e8a49f0d1e68c4f128400abeff434eb5715f1b22")
      }

    
      
      setConfidence(confidence);
      console.log(typeof(confidence))
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <Grid container className="App" direction="column" alignItems="center" justifyContent="center" marginTop="12%">
        <Grid item>
          <h1 style={{ textAlign: "center", marginBottom: "1.5em" }}>Smithsonian Exhibit ID</h1>
          <DropzoneArea
            acceptedFiles={["image/*"]}
            dropzoneText={"Add an image"}
            onChange={handleImageChange}
            maxFileSize={10000000}
            filesLimit={1}
            showAlerts={["error"]}
          />
          <Stack style={{ marginTop: "2em", width: "12rem" }} direction="row" spacing={1}>
       
            <Chip
              label={classification === null ? "Exhibit" : `Exhibit: ${classification}`}
              style={{ justifyContent: "left" }}
              variant="outlined"
            />

          </Stack>
        </Grid>
        <img src = {imageURL}></img>
        <p>{description}</p>
      </Grid>

      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Fragment>
  );
}

export default App;
