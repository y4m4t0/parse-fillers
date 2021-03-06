const xlsx = require('node-xlsx')
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/magazinus', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const Product = require('./models/Product')
const Category = require('./models/Category')

const obj = xlsx.parse('./new-table.xlsx')
let table = obj.find(o => o.name == 'База')

let counter = 0

async function fillProducts() {
    for(let row of table.data){
        let category = await Category.findOne({name: row[1]})
        if(row[0] !== undefined && category) {
            console.log(row[3])
            let product = new Product({
                image: 'https://be-online.kz/images/' + row[0] + '.jpg',
                name: row[3],
                subcategory: row[2],
                price: row[11],
                category: category._id,
                quantity: 1,
                supplier: row[4],
                shopname: row[5],
                quantityOnShop: row[6],
                unit: row[7]
            })
            product.save()
        }
    }
}


async function fillCategories() {
    let cats = []

    for(let row of table.data){
        if(row[0] !== undefined){
            let cat = {
                name: row[1],
                subcategories: [row[2]]
            }

            if(!cats.find(c => c.name == cat.name) && row[0]!=undefined && row[0] != 'Picture №'){
                cats.push(cat)
            }else if(cats.find(c => c.name == cat.name)){
                let i = cats.findIndex(c => c.name == cat.name)
                if(!cats[i].subcategories.find(s=> s == row[2])) {
                    cats[i].subcategories.push(row[2])
                }
            }
        }        
    }        
    for (let c of cats) {
        let category = Category.create({
            name: c.name,
            subcategories: c.subcategories
        })
        console.log(c.name)
    }
}

async function doTheWork() {
    await fillCategories()
    await fillProducts()
}

doTheWork()
