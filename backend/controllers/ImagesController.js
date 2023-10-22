const path = require('path');

const Images = require('../models/images');

module.exports = {

    get: (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'upload/') + req.params.name);
    },

    delete: async (req, res) => {
        try {
            await Images.destroy({ where: { id: req.params.imageId }});
    
            return res.status(200).send({ res: 'success' });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ msg: 'Ошибка на стороне сервера' });
        }
    }

}