import './App.css'
import React, {useState, useEffect} from 'react'
import NavBar from "./focusplanner/NavBar";
import FocusTimer from "./focusplanner/FocusTimer";
import TaskList from "./focusplanner/TasksList";
import SettingsModal from "./focusplanner/SettingsModal";
import StudyRoomModal from "./focusplanner/StudyRoomModal";
import { sanitize, getCSRFToken } from './utilities/utils';
import UserInfoModal from "./focusplanner/UserInfoModal";

function App() {
    const [taskList, setTaskList] = useState([])
    const [errorText, setErrorText] = useState("")
    const [user, setUser] = useState("")
    const [userEmail, setUserEmail] = useState("")
    const [userBio, setUserBio] = useState("")
    const [profilePicture, setProfilePicture] = useState("")
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [userPreferences, setUserPreferences] = useState({
        pomodoroDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        backgroundColor: '#ba4949'
    });
    const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
    const [isStudyRoomOpen, setIsStudyRoomOpen] = useState(false);
    const openUserInfo = () => setIsUserInfoOpen(true);
    const closeUserInfo = () => setIsUserInfoOpen(false);

    const createRoom = (roomName) => {
        console.log("Creating room:", roomName);
        // Implement the API call to create a room here
    };

    // New function to handle joining a room
    const joinRoom = (roomCode) => {
        console.log("Joining room with code:", roomCode);
        // Implement the API call to join a room here
    };

    // Opening and closing functions for the StudyRoomModal
    const openStudyRoom = () => setIsStudyRoomOpen(true);
    const closeStudyRoom = () => setIsStudyRoomOpen(false);


    useEffect(() => {
        getList()
        getUserInfo()
        const interval = setInterval(() => {
            getList()
            getUserInfo()
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const storedPreferences = localStorage.getItem('userPreferences');
        if (storedPreferences) {
            setUserPreferences(JSON.parse(storedPreferences));
        }
    }, [])

    function getList() {
        let xhr = new XMLHttpRequest()
        xhr.onload = function () {
            if (xhr.status === 200) {
                const json_response = JSON.parse(xhr.responseText)
                setTaskList(json_response['tasks'])

            } else {
                const error_text = JSON.parse(xhr.responseText)['error']
                setErrorText(error_text)
            }
        }
        xhr.open("GET", "focusplanner/get-tasks", true)
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        xhr.send(`csrfmiddlewaretoken=${getCSRFToken()}`)
    }

    function getUserInfo() {
        let xhr = new XMLHttpRequest()
        xhr.onload = function () {
            if (xhr.status === 200) {
                const json_response = JSON.parse(xhr.responseText)
                setUser(json_response['data']['user'])
                setUserBio(json_response['data']['bio'])
                setUserEmail(json_response['data']['email'])
                setProfilePicture(json_response['data']['picture'])

            } else {
                const error_text = JSON.parse(xhr.responseText)['error']
                setErrorText(error_text)
            }
        }
        xhr.open("GET", "focusplanner/user-info", true)
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        xhr.send(`csrfmiddlewaretoken=${getCSRFToken()}`)
    }

    // TODO
    function getUserInfoById() {}





    const openSettings = () => setIsSettingsOpen(true);
    const closeSettings = () => setIsSettingsOpen(false);
    const saveSettings = (newSettings) => {
        let xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                console.log("Response from server:", response);

                setUserPreferences({
                    pomodoroDuration: response.data.pomodoro_duration,
                    shortBreakDuration: response.data.short_break_duration,
                    longBreakDuration: response.data.long_break_duration,
                    backgroundColor: response.data.background_color
                });
                const updatedPreferences = {
                    pomodoroDuration: response.data.pomodoro_duration,
                    shortBreakDuration: response.data.short_break_duration,
                    longBreakDuration: response.data.long_break_duration,
                    backgroundColor: response.data.background_color
                };
                localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
                console.log("Updated userPreferences:", updatedPreferences);


            } else {
                const error_text = JSON.parse(xhr.responseText)['error'];
                setErrorText(error_text);
            }
        };

        xhr.open("POST", "focusplanner/update-settings", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(`pomodoro_duration=${newSettings.pomodoroDuration}&short_break_duration=${newSettings.shortBreakDuration}&long_break_duration=${newSettings.longBreakDuration}&background_color=${newSettings.backgroundColor}&csrfmiddlewaretoken=${getCSRFToken()}`);
        closeSettings();
    };


    return (

        <div>
            <style>{`
              body, html {
                  margin: 0;
                  color: white;
                  font-family: Arial, sans-serif;
                  text-align: center;
                  background-color: ${userPreferences.backgroundColor};
              }
            `}</style>
            <div className="app">
                <NavBar username={user}
                        profilePicture={profilePicture}
                        onOpenStudyRoom={openStudyRoom}
                        onOpenSettings={openSettings}
                        onOpenUserInfo={openUserInfo}
                />
                {isSettingsOpen && (
                    <SettingsModal
                        userPreferences={userPreferences}
                        onSave={saveSettings}
                        onClose={closeSettings}
                    />
                )}
                {isStudyRoomOpen && (
                    <StudyRoomModal
                        onClose={closeStudyRoom}
                        onCreateRoom={createRoom}
                        onJoinRoom={joinRoom}
                    />
                )}
                {isUserInfoOpen && (
                    <UserInfoModal
                        username={user}
                        userEmail={userEmail}
                        userBio={userBio}
                        profilePicture={profilePicture}
                        onClose={closeUserInfo}
                    />
                )}
                <FocusTimer userPreferences={userPreferences}/>
                <TaskList task_list={taskList} set_task_list={setTaskList} set_error_text={setErrorText}
                          current_user={user}/>
            </div>
        </div>
    )
}

export default App