const mongoose = require('mongoose')

const File = new mongoose.Schema({
	path: {
		type: String,
		required: true,
	},
	originalName: {
		type: String,
		required: true,
	},
	password: String,
	donwloadCount: {
		type: Number,
		required: true,
		default: 0,
	},
})

module.exports = mongoose.model('file', File)
