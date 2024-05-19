const express = require('express')
const app = express()
const multer=require('multer');
const port = 3000
const imgToPDF = require('image-to-pdf')
const fs = require('fs')
const path=require('path')

const cors=require('cors')

app.use(cors())

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
  const upload = multer({ storage: storage })


  const uploadDir = path.join(__dirname, 'uploads');
  const outputDir = path.join(__dirname, 'files');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  

app.post('/photos', upload.array('photos',20), (req, res)=>{
    try{
        if(!req.files){
            res.status(400).json({
                message:"No file was uploaded"
            })
        }

        const pages = req.files.map(file=>file.path); // path to the image

        let outputPath = path.join(outputDir, "combined.pdf");

        
         
        const pdf=imgToPDF(pages, imgToPDF.sizes.A4)
            .pipe(fs.createWriteStream(outputPath))

        pdf.on('finish',()=>{
          res.download(outputPath, err => {
            if (err) {
              console.log(err);
              return res.status(500).json({
                message: "Error downloading the file"
              });
            }
          });
        })
        

    }
    catch(error){
        console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
    }
  })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
