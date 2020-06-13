var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var methodOverride=require("method-override");
var expressSanitizer=require("express-sanitizer");

//App Config
mongoose.set("useUnifiedTopology", true);
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost:27017/restful_blog_app', { useNewUrlParser: true });

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(expressSanitizer()); //要在body-parser後面

//Mongoose/Model Config
var blogSchema=new mongoose.Schema({
	title:String,
	image:String,
	body:String,
	created:{type: Date, default: Date.now} //表示created這個變數的型態應是日期，並默認為當下日期
});

var Blog=mongoose.model("Blog", blogSchema);

// Blog.create({
// 	title:"Lil Kitten",
// 	image:"https://scx1.b-cdn.net/csz/news/800/2018/thecatsmeowt.jpg",
// 	body:"This lil kitten can do a lot of body tricks!"
// })


//Restful Routes
app.get("/", function(req, res){
	res.redirect("/blogs")
})

//Index Route
app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log(err);
		}else{
			res.render("index", {blogs:blogs});
		}
	})
})

app.get("/blogs/new", function(req, res){
	res.render("new");
})

//Create Route
app.post("/blogs", function(req, res){
	req.body.blog.body=req.sanitize(req.body.blog.body); //req.body是whatever user inputs coming from form (POST request)，blog.body是我們在這個回覆裡幫他建立一個blog物件，內含body屬性，原本應該是req.body.body，因為我們後面name="blog[body]"，所以整個回答的物件變成req.body.blog.body
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("new");
		}else{
			res.redirect("/blogs")
		}
	})
})

//Show Route
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs")
		}else{
			res.render("show", {blog:foundBlog})
		}
	})
})

//Edit Route
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs")
		}else{
			res.render("edit", {blog:foundBlog})
		}
	})
})

//Update Route
app.put("/blogs/:id", function(req, res){
	req.body.blog.body=req.sanitize(req.body.blog.body); //會把<script></script>的部分去掉
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){ //三個arguments，id, new data, callback function
		if(err){
			res.redirect("/blogs")
		}else{
			res.redirect("/blogs/"+req.params.id)
		}
	})
})

//Delete Route
app.delete("/blogs/:id", function(req, res){
	Blog.findByIdAndRemove(req.params.id, function(err){ //這裡只有一個argument，因為沒有東西會被抓出來回傳然後後面還需要用到，所以只要err就好
		if(err){
			res.redirect("/blogs")
		}else{
			res.redirect("/blogs")
		}
	})
})

app.listen(3000, function(){
	console.log("Server is running!")
})