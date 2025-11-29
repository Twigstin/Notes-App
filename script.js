
//create a class for a new note
class Note {
    constructor(id, title, desc, dateCreated, isFavorite) {
        this.id = id;
        this.title = title;
        this.desc = desc;
        this.dateCreated = dateCreated;
        this.isFavorite = isFavorite;
    }
}



class Task {
    //id, title, desc, dateCreated, category, tag, list
    constructor(id, title, desc, dateCreated, category, tag, list){
        this.id = id;
        this.title = title;
        this.desc = desc;
        this.dateCreated = dateCreated;
        this.category = category;
        this.tag = tag;
        this.list = list;
    };
}

//create class for custom dialog
class CustomDialog {
    constructor(){
        this.dialogOverlay = document.getElementById("custom-dialog");
        this.dialogMsg = document.getElementById("dialog-msg");
        this.dialogConfirmBtn = document.getElementById("yes-confirm");
        this.dialogCancelBtn = document.getElementById("no-confirm");
    };
    showCustomDialog(message) {
        return new Promise((resolve) => {
            this.dialogMsg.innerText = message;
            this.dialogOverlay.style.display = "flex";

            this.dialogConfirmBtn.onclick = () => {
                this.dialogOverlay.style.display = "none";
                resolve(true)
            }

            this.dialogCancelBtn.onclick = () => {
                this.dialogOverlay.style.display = "none";
                resolve(false);
            }
        })
    }
}


//create class for notes app
class NotesApp {
    constructor(mainApp) {
        this.allNotes = JSON.parse(localStorage.getItem("notes")) || [];
        this.showCustomDialog = new CustomDialog();
        this.mainApp = mainApp;
        
        this.onNotes = true;
        this.onTasks = false;
        this.editMode = false;
        this.addToFavoritesBtnOn = false;
        this.currentEditId = null;
        this.isOnFavoriteNotes = false;
        this.isOnFavoriteNotes = false;
        this.isOnAllNotes = true;

        //get dom elements
        this.allNotesCount = document.getElementById("all-notes-count");
        this.noteTitleinput = document.querySelector("#note-title-div input");
        this.noteDescInput = document.querySelector("#note-desc-div textarea");
        this.allFavoriteNotesCount = document.getElementById("all-favorite-notes-count");
        this.notesCtn = document.getElementById("note-list");
        this.dialogOverlay = document.getElementById("custom-dialog");
        this.dialogMsg = document.getElementById("dialog-msg");
        this.dialogConfirmBtn = document.getElementById("yes-confirm");
        this.dialogCancelBtn = document.getElementById("no-confirm");
        this.addFavoritesBtn = document.querySelector(".add-to-favorites-btn i");
    };

    //create functionality methods for the app

    //create add note method
    addNote(title, desc) {
        //id, title, desc, dateCreated, isFavorite
        const id = Date.now();
        title = title.trim();
        desc = desc.trim();
        const dateCreated = new Date().toLocaleString();
        const isFavorite = this.addToFavoritesBtnOn;
        const newNote = new Note(id, title, desc, dateCreated, isFavorite);
        this.allNotes.push(newNote);
    };


    //create delete note method
    deleteNote(id, evt) {

        evt.stopPropagation();
        this.noteTitleinput.value = "";
        this.noteDescInput.value = "";
        this.editMode = false;
        this.currentEditId = null;

        this.showCustomDialog.showCustomDialog("Are you sure you want to delete this note?")
            .then((confirmed) => {
                if (confirmed) {
                    // Save changes
                    this.allNotes = this.allNotes.filter(note => note.id !== id);
                }
                if (this.isOnFavoriteNotes) {
                const allFavoriteNotes = this.allNotes.filter(note => note.isFavorite === true);
                this.render(allFavoriteNotes);
                } else {
                    this.render();
                }
            })    
    }



    //create update note function
    updateNote(currentEditId, newTitle, newDesc, isFavorite) {
        //id, title, desc, dateCreated, isFavorite
        const noteToEdit = this.allNotes.find(note => note.id === currentEditId);
        this.allNotes = this.allNotes.map(note => {
            if (note.id === currentEditId) {
                return {
                    ...note,
                    title: newTitle,
                    desc: newDesc,
                    dateCreated: note.dateCreated,
                    lastModified: new Date().toLocaleString(),
                    isFavorite
                }
            }
            return note;            
        })
    }

    searchNotes(searchText) {
        if(this.mainApp.onNotes) {
            //create a temporary database for filterdNotes
            
                    searchText = searchText.toLowerCase();
                    const filteredNotes = this.allNotes.filter(note => note.title.toLowerCase().includes(searchText) || note.desc.toLowerCase().includes(searchText));
                    const allFavoriteNotes = this.allNotes.filter(note => note.isFavorite === true);
                    const filteredFavoritesNotes = allFavoriteNotes.filter(note => note.title.toLowerCase().includes(searchText) || note.desc.toLowerCase().includes(searchText));
    

                    if(searchText.trim() === "") {
                        if(this.isOnFavoriteNotes) {
                            this.render(allFavoriteNotes)
                        } else {
                            this.render()
                        }
                    }
                    
                    if (filteredNotes.length === 0) {
                        this.notesCtn.innerHTML = "";
                        const notFoundMessage = document.createElement("div");
                        notFoundMessage.innerHTML = `<p><i class="fa-regular fa-file"></i></p><p class="not-found">No results found</p>`;
                        notFoundMessage.classList.add("no-note-div");
                        this.notesCtn.appendChild(notFoundMessage)
                    }
                    else {
                        //this.isOnFavoriteNotes = false;
                        //this.isOnAllNotes = true;
                        if(this.isOnFavoriteNotes) {
                            this.render(filteredFavoritesNotes)
                        } else {
                            this.render(filteredNotes)
                        }
                    }
                }
    }

    truncate(text, maxLength) {
        return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
    }

    //create render function
    render(mainNotes = null) {
        if (!mainNotes) {
            mainNotes = this.allNotes;
        }
        this.allNotesCount.innerText = this.allNotes.length;
        const allFavoriteNotes = this.allNotes.filter(note => note.isFavorite === true);
        this.allFavoriteNotesCount.innerText = allFavoriteNotes.length;

        //this.allFavoriteNotes = mainNotes.filter(note => note.isFavorite === true);
        this.notesCtn.innerHTML = "";
        if (mainNotes.length === 0) {
            const notFoundMessage = document.createElement("div");
            notFoundMessage.innerHTML = `<p><i class="fa-solid fa-note-sticky"></i></p><p class="not-found">No notes here yet</p>`;
            notFoundMessage.classList.add("no-note-div");
            this.notesCtn.appendChild(notFoundMessage)
        } else {
    //loop through all notes in database and create HTML elements for each of them
            mainNotes.forEach(note => {
                const noteDiv = document.createElement("div");
                noteDiv.classList.add("note");
                noteDiv.classList.add("button");

                noteDiv.addEventListener("click", () => {
                    this.editNote(note.id);
                });
                noteDiv.innerHTML = `
                            ${note.isFavorite ? '<div class="favorite-note-tag"><i class="fa-solid fa-star"></i></div>' : ""}
                            <h2 class="note-title">${note.title}</h2>
                            <p class="note-description">${note.desc}</p>
                            <small>Date Created: ${note.dateCreated}</small>
                            <div class="note-last">
                            <small>Last Modified: ${note.lastModified || note.dateCreated}</small>
                            <button class="note-delete-btn"><i class="fas fa-trash"></i></button>
                            </div>
                            `

        const deleteBtn = noteDiv.querySelector(".note-delete-btn");
        deleteBtn.addEventListener("click", (evt) => this.deleteNote(note.id, evt));

  // Make note editable when clicked
        noteDiv.addEventListener("click", (e) => {
            if (!e.target.closest(".note-delete-btn") && !e.target.closest(".note-fav-btn")) {
                this.editNote(note.id);
            }
        });
        this.notesCtn.appendChild(noteDiv);
        
    })
    }
    //save to local storage
    this.saveNote();
    }

    //create function for custom dialog popup
    

    editNote(id) {
    //Get note being edited
        const noteToEdit = this.allNotes.find(note => note.id === id);

        this.editMode = true;
        this.currentEditId = id;

        if(!noteToEdit) {
            return;
        }
        //this.noteEditPage.classList.add("active");
        this.noteTitleinput.value = noteToEdit.title;
        this.noteDescInput.value = noteToEdit.desc;

        if(noteToEdit.isFavorite) {
            this.addFavoritesBtn.classList.remove("fa-regular");
            this.addFavoritesBtn.classList.add("fa-solid");
            this.addFavoritesBtn.style.color = "#FFC107";
            this.addToFavoritesBtnOn = true;
        } else {
            this.addFavoritesBtn.classList.remove("fa-solid");
            this.addFavoritesBtn.classList.add("fa-regular");
            this.addFavoritesBtn.style.color = "rgb(100, 100, 100)";
            this.addToFavoritesBtnOn = false;
        }
    }

    saveNote() {
        localStorage.setItem("notes", JSON.stringify(this.allNotes));
    }
    
}
//end of notes app class

//create an instance of a new task


//create tasks app class
class TasksApp {
    constructor(mainApp) {
        this.mainApp = mainApp;
        //create database
        this.allTasks = JSON.parse(localStorage.getItem("tasks")) || [];

        this.showCustomDialog = new CustomDialog();

        //get booleans
        this.editMode = false;
        this.currentEditId = null;

        //get dom elements
        this.tasksCtn = document.getElementById("task-list");
        this.taskTitleinput = document.querySelector("#task-title-div input");
        this.taskDescInput = document.querySelector("#task-desc-div textarea");
    };
    //create functionality methods for app:

    //create a method to get items from a list in html
    getListItems(listItems) {
        let allItems = [];
        listItems.forEach(item => {
            allItems.push(item.textContent);
        })
        return allItems;
    }

    //create a method to  add tasks
    addTask(title, desc, category, tag, list) {
        //id, title, desc, dateCreated, category, tag, list
        const id = Date.now();
        title = title.trim();
        desc = desc.trim();
        const dateCreated = new Date().toLocaleString();
        const newTask = new Task(id, title, desc, dateCreated, category, tag, list)
        this.allTasks.push(newTask);
    }

    //create a delete task method
    deleteTask(id, evt) {

        evt.stopPropagation();
        this.taskTitleinput.value = "";
        this.taskDescInput.value = "";
        this.editMode = false;
        this.currentEditId = null;

        this.showCustomDialog.showCustomDialog("Are you sure you want to delete this task?")
            .then((confirmed) => {
                if (confirmed) {
                    // Save changes
                    this.allTasks = this.allTasks.filter(task => task.id !== id);
                }
                
                this.render();
            })    
    }

    //create update task method
    updateTask(currentTaskEditId, newTitle, newDesc, newCategory, newTag, newList) {
        //id, title, desc, dateCreated, category, tag, list
        const taskToEdit = this.allTasks.find(task => task.id === currentTaskEditId);
        this.allTasks = this.allTasks.map(task => {
            if (task.id === currentTaskEditId) {
                return {
                    ...task,
                    title: newTitle,
                    desc: newDesc,
                    dateCreated: task.dateCreated,
                    category: newCategory,
                    tag: newTag,
                    list: newList,
                    lastModified: new Date().toLocaleString()
                }
            }
            return task;            
        })
    }

    //create method to search tasks
    searchTasks(searchText) {
        if(this.mainApp.onTasks) {
            //create a temporary database for filterdNotes
            
                    searchText = searchText.toLowerCase();
                    const filteredTasks = this.allTasks.filter(task => task.title.toLowerCase().includes(searchText) || task.desc.toLowerCase().includes(searchText));
    

                    if(searchText.trim() === "") {
                        this.render()
                    }
                    
                    if (filteredTasks.length === 0) {
                        this.tasksCtn.innerHTML = "";
                        const notFoundMessage = document.createElement("div");
                        notFoundMessage.innerHTML = `<p><i class="fa-regular fa-file"></i></p><p class="not-found">No results found</p>`;
                        notFoundMessage.classList.add("no-note-div");
                        this.tasksCtn.appendChild(notFoundMessage)
                    }
                    else {                        
                        this.render(filteredTasks);
                    }
                }
    }

    //create tasks render function
    render(mainTasks = null) {
        if (!mainTasks) {
            mainTasks = this.allTasks;
        }


        
        //add counts here



        
        this.tasksCtn.innerHTML = "";
        if (mainTasks.length === 0) {
            const notFoundMessage = document.createElement("div");
            notFoundMessage.innerHTML = `<p><i class="fa-solid fa-clipboard-list"></i></p><p class="not-found">No tasks here yet</p>`;
            notFoundMessage.classList.add("no-note-div");
            this.tasksCtn.appendChild(notFoundMessage)
        } else {
    //loop through all notes in database and create HTML elements for each of them
            mainTasks.forEach(task => {
                const taskDiv = document.createElement("div");
                taskDiv.classList.add("task");
                taskDiv.classList.add("button");

                taskDiv.addEventListener("click", () => {
                    this.editNote(task.id);
                });
                taskDiv.innerHTML = `
                            <ul class="main-task-txt">
                                <li>
                                    <input type="checkbox" class="task-checkbox">
                                </li>
                                <li class="task-title">${task.title}</li>
                            </ul>
                            <ul class="task-delete-btn">
                                <li><i class="fas fa-trash"></i></li>
                            </ul>
                            <ul>
                                <li class="forward-icon"><i class="fa-solid fa-angle-right"></i></li>
                            </ul>
                            `

        const deleteBtn = taskDiv.querySelector(".task-delete-btn");
        deleteBtn.addEventListener("click", (evt) => this.deleteTask(task.id, evt));

  // Make note editable when clicked
        taskDiv.addEventListener("click", (e) => {
            if (!e.target.closest(".task-delete-btn")) {
                this.editNote(task.id);
            }
        });
        this.tasksCtn.appendChild(taskDiv);
        
    })
    }
    //save to local storage
    this.saveNote();
    }


    //create method edit task functionality
    editNote(id) {
    //Get note being edited
        const taskToEdit = this.allTasks.find(task => task.id === id);

        this.editMode = true;
        this.currentEditId = id;

        if(!taskToEdit) {
            return;
        }
        //this.noteEditPage.classList.add("active");
        this.taskTitleinput.value = taskToEdit.title;
        this.taskDescInput.value = taskToEdit.desc;

        
        /**
        if(noteToEdit.isFavorite) {
            this.addFavoritesBtn.classList.remove("fa-regular");
            this.addFavoritesBtn.classList.add("fa-solid");
            this.addFavoritesBtn.style.color = "#FFC107";
            this.addToFavoritesBtnOn = true;
        } else {
            this.addFavoritesBtn.classList.remove("fa-solid");
            this.addFavoritesBtn.classList.add("fa-regular");
            this.addFavoritesBtn.style.color = "rgb(100, 100, 100)";
            this.addToFavoritesBtnOn = false;
        }
             */
    }

    saveTask() {
        localStorage.setItem("tasks", JSON.stringify(this.allTasks));
    }
}


class MainApp {
    constructor() {
        this.showCustomDialog = new CustomDialog();        
        this.notesApp = new NotesApp(this);
        this.tasksApp = new TasksApp(this);
        
        this.onNotes = true;
        this.onTasks = false;
        this.isOnAllNotes = true;

        //get dom elements
        this.notesCtn = document.getElementById("note-list");
        this.addbtns = document.querySelectorAll(".addy");
        this.noteEditPage = document.getElementById("note-edit-page")
        this.noteEditPageKebabMenuBtn = document.getElementById("note-edit-page-exit-btn-div")
        this.noteTitleinput = document.querySelector("#note-title-div input");
        this.noteDescInput = document.querySelector("#note-desc-div textarea")
        this.slidebar = document.getElementById("sidebar");
        this.notesMenu = document.getElementById("notes-menu");
        this.tasksMenu = document.getElementById("tasks-menu");
        this.notesDisplay = document.getElementById("main");
        this.tasksDisplay = document.getElementById("tasks-display");
        this.saveNoteBtn = document.getElementById("save-note-btn");
        this.slideIcon = document.querySelector(".slide-menu");
        this.dialogOverlay = document.getElementById("custom-dialog");
        this.dialogMsg = document.getElementById("dialog-msg");
        this.dialogConfirmBtn = document.getElementById("yes-confirm");
        this.dialogCancelBtn = document.getElementById("no-confirm");
        this.slideNav = document.querySelector(".slide-nav-menu");
        this.main = document.querySelector("main");
        this.header = document.querySelector("header");
        this.addFavoritesBtn = document.querySelector(".add-to-favorites-btn i");
        this.allNotesBtn = document.getElementById("all-the-notes-btn");
        this.allFavoriteNoteBtn = document.getElementById("all-favorite-notes-btn");
        this.noteCategoryText = document.getElementById("note-categories-text");
        this.allNotesCount = document.getElementById("all-notes-count");
        this.allFavoriteNotesCount = document.getElementById("all-favorite-notes-count");
        this.searchBar = document.querySelectorAll(".search-bar");
        this.tasksList = document.getElementById("task-list");
        this.notesMenuDiv = document.getElementById("notes-menu-div");
        this.tasksMenuDiv = document.getElementById("tasks-menu-div");
        this.taskEditPage = document.getElementById("task-edit-page");

        //add dom funtionalities
        this.addbtns.forEach(btn => {
            btn.addEventListener("click", () => {
                if (this.onNotes) {
                    this.noteEditPage.classList.add("active");
                    if(this.notesApp.isOnFavoriteNotes) {
                        this.addFavoritesBtn.classList.remove("fa-regular");
                        this.addFavoritesBtn.classList.add("fa-solid");
                        this.addFavoritesBtn.style.color = "#FFC107";
                        this.notesApp.addToFavoritesBtnOn = true;
                    } else {
                        this.addFavoritesBtn.classList.remove("fa-solid");
                        this.addFavoritesBtn.classList.add("fa-regular");
                        this.addFavoritesBtn.style.color = "rgb(100, 100, 100)";
                        this.notesApp.addToFavoritesBtnOn = false;
                    }
                    this.updateScrollLock()
                }
                else if (this.onTasks) {
                    this.taskEditPage.classList.add("active");
                }
            })
        });

//save button functionality
        this.saveNoteBtn.addEventListener("click", () => {
            const title = this.noteTitleinput.value.trim();
            const desc = this.noteDescInput.value.trim();
    
    
            if(!title && !desc) {
                alert("Please fill in the title and description");
                return;
            }
            let isFavorite = this.notesApp.addToFavoritesBtnOn ? true : false;
            if(this.notesApp.editMode) {
                this.notesApp.updateNote(this.notesApp.currentEditId, title, desc, isFavorite)
            
        //After that, render UI feedback with render function
                this.notesApp.render()

        //Then reset return all elements inputs display and modes to default
                this.noteEditPage.classList.remove("active");
                this.notesApp.editMode = false;
                this.notesApp.currentEditId = null;
                this.addFavoritesBtn.classList.remove("fa-solid");
                this.addFavoritesBtn.classList.add("fa-regular");
                this.addFavoritesBtn.style.color = "rgb(100, 100, 100)";
                this.notesApp.addToFavoritesBtnOn = false;
            }
            else {
                this.notesApp.addNote(title, desc);                
            }

            this.notesApp.saveNote();

    //then render ui feedback
            if(this.notesApp.isOnFavoriteNotes) {
                const allFavoriteNotes = this.notesApp.allNotes.filter(note => note.isFavorite === true);
                this.notesApp.render(allFavoriteNotes);
            }
            else {
                this.notesApp.render();
            }

    //return all elements display to default
            this.noteTitleinput.value = "";
            this.noteDescInput.value = "";
            this.noteEditPage.classList.remove("active");
            this.updateScrollLock();
            this.notesApp.editMode = false;
            this.notesApp.currentEditId = null;
            this.addFavoritesBtn.classList.remove("fa-solid");
            this.addFavoritesBtn.classList.add("fa-regular");
            this.addFavoritesBtn.style.color = "rgb(100, 100, 100)";
            this.notesApp.addToFavoritesBtnOn = false;

        })
//save button functionality end

        if (this.onNotes) {
            this.notesMenu.classList.add("toggled");
            this.tasksMenu.classList.remove("toggled");
            this.notesMenuDiv.style.display = "block";
            this.tasksMenuDiv.style.display = "none";
        }

        if (this.onTasks) {
            this.tasksMenu.classList.add("toggled")
            this.notesMenu.classList.remove("toggled");
            this.notesMenuDiv.style.display = "none";
            this.tasksMenuDiv.style.display = "block";
        }

        this.notesMenu.addEventListener("click", () => {
            this.onNotes = true;
            this.onTasks = false;
            this.notesMenu.classList.add("toggled");
            this.tasksMenu.classList.remove("toggled")
            this.tasksDisplay.style.display = "none";
            this.notesDisplay.style.display = "block";
            this.notesMenuDiv.style.display = "block";
            this.tasksMenuDiv.style.display = "none";
        })

        this.tasksMenu.addEventListener("click", () => {
            this.onNotes = false;
            this.onTasks = true;
            this.tasksMenu.classList.add("toggled")
            this.notesMenu.classList.remove("toggled");
            this.tasksDisplay.style.display = "block";
            this.notesDisplay.style.display = "none";
            this.notesMenuDiv.style.display = "none";
            this.tasksMenuDiv.style.display = "block";
        })

        this.slideIcon.addEventListener("click", (e) => {
            e.stopPropagation();
            this.slideIcon.classList.toggle("active");
            this.slidebar.classList.toggle("active");
            this.updateScrollLock()
        });

        this.main.addEventListener("click", () => {
            this.slidebar.classList.remove("active");
            this.slideIcon.classList.remove("active");
            this.updateScrollLock();
        })

        this.header.addEventListener("click", () => {
            this.slidebar.classList.remove("active");
            this.slideIcon.classList.remove("active");
            this.updateScrollLock()
        })

        this.slideNav.addEventListener("click", () => {
            this.slidebar.classList.remove("active");
            this.slideIcon.classList.remove("active");
            this.updateScrollLock()
        })

        this.slidebar.addEventListener("wheel", e => e.stopPropagation(), { passive: false })
        this.slidebar.addEventListener("touchmove", e => e.stopPropagation(), { passive: false })

        document.addEventListener("click", () => {
            if(this.slidebar.classList.contains("active")) {
                this.slidebar.classList.remove("active");
                this.slideIcon.classList.remove("active");
            }
        });

        this.notesCtn.addEventListener("click", (e) => {
            const clickedNote = e.target.closest(".note");
            if (clickedNote && !e.target.closest(".note-delete-btn")) {
                this.noteEditPage.classList.add("active");
                this.updateScrollLock();
            }
        });


        //close note edit page
        this.noteEditPageKebabMenuBtn.addEventListener("click", () => {
            const title = this.noteTitleinput.value.trim();
            const desc = this.noteDescInput.value.trim();
            const isFavorite = this.notesApp.addToFavoritesBtnOn ? true : false;

            if (this.notesApp.editMode) {
                this.showCustomDialog.showCustomDialog("Do you want to save changes made on this note?")
                    .then((confirmed) => {
                        if (confirmed) {
                            this.notesApp.updateNote(this.notesApp.currentEditId, title, desc, isFavorite)

                            this.notesApp.saveNote()
                        }

                // Whether confirmed or not, close the editor afterward
                        const allFavoriteNotes = this.notesApp.allNotes.filter(note => note.isFavorite === true);
                        if (this.notesApp.isOnFavoriteNotes) {
                            this.notesApp.render(allFavoriteNotes);
                        } else {
                            this.notesApp.render();
                        }

                // Reset inputs & mode
                        this.noteEditPage.classList.remove("active");
                        this.updateScrollLock();
                        this.noteTitleinput.value = "";
                        this.noteDescInput.value = "";
                        this.notesApp.editMode = false;
                        this.notesApp.currentEditId = null;
                        this.addFavoritesBtn.classList.remove("fa-solid");
                        this.addFavoritesBtn.classList.add("fa-regular");
                        this.addFavoritesBtn.style.color = "rgb(100, 100, 100)";
                        this.notesApp.addToFavoritesBtnOn = false;
                    });
            } else if (!this.notesApp.editMode && (this.noteDescInput.value.trim() !== "" || this.noteTitleinput.value.trim() !== "")) {
                this.showCustomDialog.showCustomDialog("Do you want to save this new note?")
                    .then((confirmed) => {
                        if (confirmed) {
                            this.addNote(title, desc)

                            this.notesApp.saveNote()
                        }

                // Whether confirmed or not, close the editor afterward
                        const allFavoriteNotes = this.notesApp.allNotes.filter(note => note.isFavorite === true);
                        if (this.notesApp.isOnFavoriteNotes) {
                            this.notesApp.render(allFavoriteNotes);
                        } else {
                            this.notesApp.render();
                        }

                // Reset inputs & mode
                        this.noteEditPage.classList.remove("active");
                        this.updateScrollLock();
                        this.noteTitleinput.value = "";
                        this.noteDescInput.value = "";
                        this.notesApp.editMode = false;
                        this.notesApp.currentEditId = null;
                        this.addFavoritesBtn.classList.remove("fa-solid");
                        this.addFavoritesBtn.classList.add("fa-regular");
                        this.addFavoritesBtn.style.color = "rgb(100, 100, 100)";
                        this.notesApp.addToFavoritesBtnOn = false;
                    });
            } 
    
            else {
        // If not in edit mode
                if(this.notesApp.isOnFavoriteNotes) {
                    this.noteEditPage.classList.remove("active");
                    this.updateScrollLock();
                    this.noteTitleinput.value = "";
                    this.noteDescInput.value = "";
                    this.addFavoritesBtn.classList.remove("fa-regular");
                    this.addFavoritesBtn.classList.add("fa-solid");
                    this.addFavoritesBtn.style.color = "#FFC107";
                    this.notesApp.addToFavoritesBtnOn = true;
                } else {
                    this.noteEditPage.classList.remove("active");
                    this.updateScrollLock();
                    this.noteTitleinput.value = "";
                    this.noteDescInput.value = "";
                    this.addFavoritesBtn.classList.remove("fa-solid");
                    this.addFavoritesBtn.classList.add("fa-regular");
                    this.addFavoritesBtn.style.color = "rgb(100, 100, 100)";
                    this.notesApp.addToFavoritesBtnOn = false;
                }

        
                if (this.notesApp.isOnFavoriteNotes) {
                    this.notesApp.render(allFavoriteNotes);
                } else {
                    this.notesApp.render();
                }
            }
        });

        this.addFavoritesBtn.addEventListener("click", () => {
            if(this.addFavoritesBtn.classList.contains("fa-regular")) {
                this.addFavoritesBtn.classList.remove("fa-regular");
                this.addFavoritesBtn.classList.add("fa-solid");
                this.addFavoritesBtn.style.color = "#FFC107";
                this.notesApp.addToFavoritesBtnOn = true;
            } else {
                this.showCustomDialog.showCustomDialog("If you remove the favorite tag, this note will not appear in your favorites. Are you sure you want to continue?")
                    .then((confirmed) => {
                        if (confirmed) {
                    // Save changes
                            this.addFavoritesBtn.classList.remove("fa-solid");
                            this.addFavoritesBtn.classList.add("fa-regular");
                            this.addFavoritesBtn.style.color = "rgb(100, 100, 100)";
                            this.notesApp.addToFavoritesBtnOn = false;
                        }
                
                    })
            
            }
        });

        if(this.isOnAllNotes) {
            this.allNotesBtn.classList.add("active");
            this.allFavoriteNoteBtn.classList.remove("active");
        }
        if(this.notesApp.isOnFavoriteNotes) {
            this.allNotesBtn.classList.remove("active");
            this.allFavoriteNoteBtn.classList.add("active");
        }

        this.allNotesBtn.addEventListener("click", () => {
            this.isOnAllNotes = true;
            this.notesApp.isOnFavoriteNotes = false;
            this.allNotesBtn.classList.add("active");
            this.allFavoriteNoteBtn.classList.remove("active");
            this.noteCategoryText.innerText = "All Notes"
            this.notesApp.render();
        })
        this.allFavoriteNoteBtn.addEventListener("click", () => {
    //get all favorite notes
            const allFavoriteNotes = this.notesApp.allNotes.filter(note => note.isFavorite === true);
            this.isOnAllNotes = false;
            this.notesApp.isOnFavoriteNotes = true;
            this.allNotesBtn.classList.remove("active");
            this.allFavoriteNoteBtn.classList.add("active");
            this.noteCategoryText.innerText = "Favorite Notes"
            this.notesApp.render(allFavoriteNotes)
        })

        this.searchBar.forEach(bar => {
            bar.addEventListener("input", (e) => {
                this.notesApp.searchNotes(e.target.value);
            })
        })

        //add tasks app functionality
        this.tasksList.addEventListener("click", (e) => {
            if(e.target.classList.contains("task-checkbox")) {
                const task = e.target.closest(".task");
                const text = task.querySelector(".task-title");

                if (e.target.checked) {
                    text.classList.add("completed")
                } else {
                    text.classList.remove("completed")
                }
            }
        })

    };
    

    updateScrollLock() {
        const sidebarOpen = this.slidebar.classList.contains("active");
        const notePageOpen = this.noteEditPage.classList.contains("active");

        if (sidebarOpen || notePageOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }
    
    render() {
        this.notesApp.render();
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const App = new MainApp()
    App.render()
})
