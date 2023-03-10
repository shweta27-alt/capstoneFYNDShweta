<template>
  <div>
    <div class="close-friend-sidebar">
      <img src="../assets/cross.png" alt="" @click="closeFriendSideBar" />
    </div>
    <div v-if="!(selectChat && selectChat.isGroupChat)">
      <div class="friend-photo-user">
        <img :src="getFriendUserImage" />
      </div>
      <div class="friends-info">
        <div>{{ getFriendUserName }}</div>
        <div>{{ getFriendPhoneNumber }}</div>
        <div>{{ getFriendEmail }}</div>
      </div>
      <div class="friends-about">
        <div class="friends-about-txt">About</div>
        <textarea
          class="friends-about-data"
          name=""
          id=""
          cols="30"
          rows="10"
          disabled
          v-model="getFriendsProfileBio"
        />
      </div>
    </div>
    <div class="group-info" v-else>
      <div class="group-participants">
        <div>Group info</div>
      </div>
      <div class="edit-group-participants">
        <div>
          <div>Group name</div>
          <input
            type="text"
            class="about-user-text"
            v-model="groupName"
            :disabled="editGroupName"
          />
          <img
            class="groupName-icon"
            src="../assets/pencil.png"
            alt=""
            @click="updateGroupName"
            v-if="editGroupName && isGroupAdmin"
          />
          <img
            class="groupName-icon"
            src="../assets/check.png"
            alt=""
            @click="submitGroupName"
            v-if="!editGroupName && isGroupAdmin"
          />
        </div>

        <div class="group-admin">
          <div>Group Admin</div>
          <input
            type="text"
            class="about-user-text"
            v-model="groupAdminName"
            disabled
          />
        </div>

        <div class="exit-group-button">
          <button @click="exitGroup"><strong>Exit Group</strong></button>
        </div>

        <div class="search-bar-title">Add or edit participants</div>
        <div class="search-bar-wrapper">
          <div v-if="groupUser.length > 0">
            <div class="group-add-user-wrapper">
              <div
                v-for="data in groupUser"
                :key="data.username"
                class="group-user"
              >
                <div class="group-user-info">
                  <div class="group-user-img">
                    <img :src="data.profilePic" alt="" />
                  </div>
                  <div class="group-user-name">{{ data.fullName }}</div>
                </div>
                <div
                  class="remove-group-user"
                  @click="removeGroupUser(data)"
                  v-if="isGroupAdmin"
                >
                  <img src="../assets/cross.png" alt="" />
                </div>
              </div>
            </div>
          </div>
          <input
            type="text"
            placeholder="Search user and add to group"
            class="search-bar"
            v-model="userSearchData"
            @input="searchUser"
            v-if="isGroupAdmin"
          />
        </div>

        <div class="user-wrapper" v-if="userSearchData && isGroupAdmin">
          <div class="user">
            <div
              class="user-data"
              v-for="data in responseUser"
              :key="data.username"
              @click="addGroupUser(data)"
            >
              <div>
                <img :src="data.profilePic" class="user-pic" />
              </div>
              <div class="search-user">
                <p class="friend-name">{{ data.fullName }}</p>
                <p class="friend-detail">{{ data.email }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiService from "../services/api.services";
export default {
  props: {
    selectChat: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      userData: null,
      responseUser: [],
      userSearchData: "",
      groupUser: [],
      editGroupName: true,
      groupName: "testtt",
      isGroupUser: false,
      groupAdminName: "",
    };
  },
  mounted() {
    this.userData = this.$store.state.userData.user;
    this.selectChat && (this.groupName = this.selectChat.chatName);
    this.groupAdminName =
      this.selectChat &&
      this.selectChat.groupAdmin &&
      this.selectChat.groupAdmin.fullName;
    this.groupUser =
      this.selectChat &&
      this.selectChat.isGroupChat &&
      this.selectChat.users.filter((val) => {
        return val._id != this.userData._id;
      });
  },

  computed: {
    getFriendUserName() {
      //get the friend username in chat users whose id not matches with current loggedin user id
      if (this.selectChat.isGroupChat) {
        return this.selectChat.chatName;
      } else {
        let user =
          this.selectChat.users &&
          this.selectChat.users.find((val) => {
            return val._id != (this.userData && this.userData._id);
          });
        return user && user.fullName;
      }
    },
    getFriendUserImage() {
      //get the friend user image in chat users whose id not matches with current loggedin user id
      if (!this.selectChat.isGroupChat) {
        let user =
          this.selectChat.users &&
          this.selectChat.users.find((val) => {
            return val._id != (this.userData && this.userData._id);
          });
        return user && user.profilePic;
      } else {
        return "https://res.cloudinary.com/dkidih85l/image/upload/v1674413380/ndfqhrchmispwymvcsyh.png";
      }
    },

    getFriendPhoneNumber() {
      //get the friend phone number in chat users whose id not matches with current loggedin user id
      let user =
        this.selectChat.users &&
        this.selectChat.users.find((val) => {
          return val._id != (this.userData && this.userData._id);
        });
      return user && user.mobile[0].phoneNumber;
    },

    getFriendEmail() {
      //get the friend email  in chat users whose id not matches with current loggedin user id
      let user =
        this.selectChat.users &&
        this.selectChat.users.find((val) => {
          return val._id != (this.userData && this.userData._id);
        });
      return user && user.email;
    },
    getFriendsProfileBio() {
      //get the friend profile bio in chat users whose id not matches with current loggedin user id
      let user =
        this.selectChat.users &&
        this.selectChat.users.find((val) => {
          return val._id != (this.userData && this.userData._id);
        });

      return user && user.profileBio;
    },

    isGroupAdmin() {
      return (
        (this.userData && this.userData._id) == this.selectChat.groupAdmin._id
      );
    },
  },

  methods: {
    async searchUser() {
      //debounce the serch user result with 300 milliseconds
      let timer;
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          let response = await apiService.usersearch(this.userSearchData);
          this.responseUser = response.data.users;
        } catch (err) {
          console.log(err);
          this.$toast.show("Something went wrong", {
            type: "error",
            position: "top",
          });
        }
      }, 300);
    },
    addGroupUser(user) {
      let ifGroupUserExists = this.groupUser.find((val) => val._id == user._id);
      let data = { chatId: this.selectChat._id, userId: user._id };
      //if user already exists then throw error otherwise add in group
      if (!ifGroupUserExists) {
        apiService
          .addgroupuser(data)
          .then(() => {
            this.groupUser.push(user);
          })
          .catch((error) => {
            this.$toast.show("Something went wrong", {
              type: "error",
              position: "top",
            });
            console.log(error);
          });
      } else {
        this.$toast.show("User already added to group", {
          type: "error",
          position: "top",
        });
      }
    },
    removeGroupUser(user) {
      let data = { chatId: this.selectChat._id, userId: user._id };
      apiService
        .removegroupuser(data)
        .then(() => {
          let removeUserIndex = this.groupUser.findIndex(
            (val) => val._id == user._id
          );
          if (removeUserIndex >= 0) {
            this.groupUser.splice(removeUserIndex, 1);
          }
        })
        .catch((error) => {
          this.$toast.show("Something went wrong", {
            type: "error",
            position: "top",
          });
          console.log(error);
        });
    },
    updateGroupName() {
      this.editGroupName = false;
    },
    submitGroupName() {
      //throw error if group name is empty
      if (!this.groupName) {
        return this.$toast.show("Group name should not be empty", {
          type: "error",
          position: "top",
        });
      }
      //otherwise rename the group
      let data = { chatName: this.groupName, chatId: this.selectChat._id };
      apiService
        .renamegroup(data)
        .then((response) => {
          this.editGroupName = true;
          this.$emit("selectedChat", response.data.getUpdateChat[0]);
          this.$emit("fetchChat");
        })
        .catch((error) => {
          this.$toast.show("Something went wrong", {
            type: "error",
            position: "top",
          });
          console.log(error);
        });
    },

    exitGroup() {
      //exit the user from the group by passing the user id
      let data = { chatId: this.selectChat._id, userId: this.userData._id };
      apiService
        .removegroupuser(data)
        .then(() => {
          this.$emit("fetchChat");
          this.$emit("onUserLeft");
        })
        .catch((error) => {
          this.$toast.show("Something went wrong", {
            type: "error",
            position: "top",
          });
          console.log(error);
        });
    },
    closeFriendSideBar() {
      this.$emit("closeFriendsSidebar");
    },
  },
};
</script>

<style lang="scss" scoped>
.friend-user {
  height: 130px;
  padding-top: 20px;
  border-radius: 50%;
}

.friend-photo-user {
  border-radius: 50%;
  height: 100px;
  width: 100px;
  overflow: hidden;
  margin: auto;
  margin-top: 16px;
  img {
    height: 100%;
    cursor: pointer;
  }
}

.friends-info {
  margin-top: 10px;
}

.user-wrapper {
  display: flex;
  flex-direction: column;
  height: 35%;
  overflow: hidden;
  overflow-y: scroll;
}
.user-data {
  display: flex;
  align-items: center;
  overflow: scroll;
}

.about-me-text {
  text-align: left;
  padding-left: 10px;
  font-size: 12px;
}

.name-info,
.about-me-text,
.phone-info {
  text-align: left;
  padding-left: 10px;
  font-size: 12px;
}

.user-profile-img,
.info-button-img,
.user-telephone {
  height: 15px;
  width: 15px;
  margin-top: 13px;
}

.Username,
.about-me,
.Phone-no {
  display: flex;
  padding-left: 10px;
}
.about-user-text {
  padding: 0;
}

.profile-name,
.about-user-text,
.phone-no-info {
  font-size: 14px;
  padding-left: 10px;
  border: none;
  resize: none;
  outline: none;
}

.info-button-img,
.user-telephone {
  height: 15px;
  width: 15px;
}
.groupName-icon {
  height: 15px;
  margin-left: 5px;
  cursor: pointer;
}
.profile-bio {
  display: flex;
  align-items: center;
  @media only screen and (max-width: 600px) {
    width: 80%;
  }
}
.about-me-profile {
  @media only screen and (max-width: 600px) {
    width: 100%;
  }
}
.user-pic {
  height: 40px;
  width: 40px;
  /* margin-left:5px; */
  padding-top: 10px;
}

.friend-name {
  font-size: 14px;
  font-weight: 10;
  margin-left: 15px;
}
.group-user {
  background-color: #e9edef;
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  padding-top: 2px;
  padding-bottom: 2px;
  padding-right: 8px;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-top: 3px;
  padding-bottom: 3px;
  cursor: pointer;
}
.group-user-img {
  height: 15px;
  img {
    height: 100%;
    border-radius: 50%;
  }
}
.group-user-info {
  display: flex;
  align-items: center;
}
.remove-group-user {
  height: 10px;
  padding-bottom: 9px;
  img {
    height: 100%;
  }
}
.search-user {
  text-align: left;
  font-size: 13px;
  margin-left: 10px;
  p {
    margin: 0;
  }
}
.friends-about {
  margin-top: 20px;
  text-align: left;
  margin-left: 15px;
  margin-right: 15px;
  border-top: 1px solid #e9edef;
  .friends-about-txt {
    margin-top: 10px;
  }
}

.group-info {
  margin-top: 20px;
  height: 96%;
}
.group-participants {
  margin-top: 20px;
  text-align: left;
  font-weight: bold;
}
.edit-group-participants {
  margin-top: 20px;
  text-align: left;
  height: 83%;
}
.group-add-user-wrapper {
  height: 110px;
  overflow-y: scroll;
  margin-bottom: 20px;
}
.friends-about-data {
  resize: none;
  width: 100%;
  margin-top: 10px;
}
.search-bar {
  width: 100%;
  height: 28px;
  padding: 0;
  margin: 0;
  border: 1px solid #d5dfea;
  border-radius: 16px;
  box-sizing: border-box;
  outline: none;
  padding-left: 12px;
  font-size: 12px;
}
.search-bar-wrapper {
  margin-top: 5px;
}
.edit-group {
  height: 40px;
  text-align: center;
  img {
    height: 100%;
  }
}
.group-user-name {
  margin-left: 5px;
}
.search-bar-title {
  margin-top: 20px;
}

.group-admin {
  margin-top: 10px;
}
.exit-group-button {
  button {
  background-color: rgb(255, 3, 3);
  color:white;
  width: 70%;
  height: 30px;
  margin-top: 20px;
  margin-left: 30px;
  margin-right: 30px;
  border-radius: 5px;
  border: 1px;
  cursor: pointer;
  }
}
.close-friend-sidebar {
  height: 10px;
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  img {
    height: 100%;
  }
}
</style>
