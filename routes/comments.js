"use strict"

const   express = require("express"),
        router  = express.Router({mergeParams: true}),
        Campground  = require("../models/campground"),
        Comment  = require("../models/comment");
    
//==================
// Comments routes
//==================

//new
router.get("/new", isLoggedIn,function(req, res) {
    // find campground by id and pass
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect("back");
        } else {
            res.render("comments/new", {campground: campground});        
        }
        
    });
    
});

//create
router.post("/", isLoggedIn, function(req, res) {
    //lookup campground using id
    Campground.findById(req.params.id, function(err, campground) {
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
    //create new comment
    //connect new comment to campground
    //redirect to campground show page
});

// edit
router.get("/:comment_id/edit", checkCommentOwnership, function(req, res) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    });
});

// update
router.put("/:comment_id", checkCommentOwnership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
       if (err) {
           res.redirect("back");
       } else {
           res.redirect("/campgrounds/" + req.params.id);
       }
   });
});

// Destroy
router.delete("/:comment_id", checkCommentOwnership, function(req, res) {
  Comment.findByIdAndRemove(req.params.comment_id, function(err){
      if(err){
          res.redirect("back");
      } else {
          res.redirect("/campgrounds/" + req.params.id);
      }
  });
});

function checkCommentOwnership(req, res, next){
        //is user logged in?
            //does user own the campground?
            // otherwise, redirect
        // if not, redirect
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            } else {
                if(foundComment.author.id.equals(req.user._id)){
                    next();            
                } else {
                    res.redirect("back");
                }
            }
        });    
    } else {
        res.redirect("back");
    }
}


module.exports = router;

//middleware
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}