require('dotenv').config()

const bcrypt = require('bcrypt')
const multer = require('multer')
const mongoose = require('mongoose')
const helmet = require('helmet')

const express = require('express')
const app = express()
app.use(express.urlencoded({ extended: true })) // read normal form

const File = require('./models/File')

const upload = multer({ dest: 'uploads' }) // Can read multipart form

mongoose.connect(process.env.DATABASE_URL)

app.set('view engine', 'ejs') // setting ejs template

app.use(helmet()) // for secure header

app.get('/', (req, res) => {
	res.render('index')
})

app.get('/files', async (req, res) => {
	const files = await File.find()
	res.render('files', { files, hostlink: `http://${req.headers.host}` })
})

app.route('/file/:id').get(handleDonwload).post(handleDonwload)

app.post('/upload', upload.single('file'), async (req, res) => {
	const fileData = {
		path: req.file.path,
		originalName: req.file.originalname,
	}

	if (req.body.password !== null && req.body.password !== '') {
		fileData.password = await bcrypt.hash(req.body.password, 10)
	}

	const file = await File.create(fileData)

	console.log('File upload:', file.originalName, ',id:', file.id)
	res.redirect('/files')
})

app.listen(process.env.PORT)

async function handleDonwload(req, res) {
	const file = await File.findById(req.params.id)
	if (file.password !== null) {
		if (req.body.password == null) {
			res.render('password', { fileLink: `http://${req.headers.host}/file/${file.id}` })
			return
		}

		if (!(await bcrypt.compare(req.body.password, file.password))) {
			res.render('password', { error: true })
			return
		}
	}

	file.donwloadCount++
	await file.save()

	console.log(req.params.id, file.donwloadCount)
	res.download(file.path, file.originalName)
}
