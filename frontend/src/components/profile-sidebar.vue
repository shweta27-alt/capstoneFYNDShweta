<template>
  <div>
    <div class="profile-photo-user">
      <label for="image-input">
        <img
          :src="profiledata && profiledata.profilePic"
          class="profile-picture"
        />
      </label>
      <input type="file" id="image-input" @change="uploadProfileImage" />
    </div>

    <div class="user-information">
      <div class="username">
        <div class="user-name-profile">
          <img src="../assets/user.png" class="user-profile-img" />
        </div>

        <div>
          <p class="name-info">Name</p>
          <p class="profile-name">{{ profiledata && profiledata.fullName }}</p>
        </div>
      </div>

      <div class="about-me">
        <div>
          <img src="../assets/info-button.png" class="info-button-img" />
        </div>

        <div class="about-me-profile">
          <p class="about-me-text">About</p>
          <div class="profile-bio">
            <textarea
              type="text"
              class="about-user-text"
              v-model="profileBio"
              @input="profileBioChange"
              :disabled="editProfileBio"
               @keydown="onKeyDown"
            />
            <img
              class="profilebio-icon"
              src="../assets/pencil.png"
              alt=""
              @click="updateProfileBio"
              v-if="editProfileBio"
            />
            <img
              class="profilebio-icon"
              src="../assets/check.png"
              alt=""
              @click="submitProfileBio"
              v-else
            />
          </div>
        </div>
      </div>

      <div class="Phone-no">
        <div class="User-phone-no">
          <img src="../assets/telephone.png" class="user-telephone" />
        </div>
        <div>
          <p class="phone-info">Phone</p>
          <p class="phone-no-info">
            {{
              profiledata &&
              `+${profiledata.mobile[0]["countryCode"]} ${profiledata.mobile[0]["phoneNumber"]} `
            }}
          </p>
        </div>
      </div>
    </div>

    <div><button v-on:click="logout" class="logout-button">Logout</button></div>
  </div>
</template>

<script>
import apiService from "@/services/api.services";
import axios from "axios";
export default {
  props: {
    isFriendsProfile: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      profiledata: null,
      profileBio: "",
      editProfileBio: true,
    };
  },
  mounted() {
    this.profiledata = this.$store.state.userData.user;
    //set default bio if current logged in user bio is empty
    this.profileBio =
      this.profiledata && this.profiledata.profileBio
        ? this.profiledata.profileBio
        : "Hey there, I am using chatify";
  },
  methods: {
    onKeyDown(evt){
      //max 100 character limit for profile bio
      if (this.profileBio.length >= 100) {
        if (evt.keyCode >= 48 && evt.keyCode <= 90) {
          evt.preventDefault()
          return
        }
      }
    },
    updateProfileBio() {
      this.editProfileBio = false;
    },
    submitProfileBio() {
      //update the current logged in user profile bio
      this.editProfileBio = true;
      apiService
        .profileupdate({ profileBio: this.profileBio })
        .then(({ data }) => {
          this.profiledata = data.user;
          this.$store.dispatch("getUserData");
          this.$emit("userData", this.profiledata);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    profileBioChange(e) {
      e.target.style.height = `${e.target.scrollHeight}px`;
    },
    logout() {
      //logout the user 
      apiService
        .logout()
        .then(() => {
          this.$router.push("/auth/login");
        })
        .catch((error) => {
          console.log(error);
        });
    },
    updateProfileImage(data) {
      //update the current logged in user profile image
      apiService
        .profileupdate({ profileImage: data })
        .then(({ data }) => {
          this.profiledata = data.user;
          this.$store.dispatch("getUserData");
          this.$emit("userData", this.profiledata);
        })
        .catch((error) => {
          this.$toast.show("Something went wrong", {
            type: "error",
            position: "top",
          });
          console.log(error);
        });
    },
    async uploadProfileImage(e) {
      let values = e.target.files[0];
      const data = new FormData();
      data.append("file", values);
      data.append("upload_preset", "Chatify");
      const getHeader = () => {
        return {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        };
      };
      //send upload image data and call the cloudnary api to get the image url
      axios
        .post(
          "https://api.cloudinary.com/v1_1/dkidih85l/image/upload",
          data,
          { withCredentials: false },
          getHeader()
        )
        .then(({ data }) => {
          this.updateProfileImage(data.secure_url); //update the profile pic with cloudnary secure image url
        })
        .catch((err) => {
          this.$toast.show("Something went wrong", {
            type: "error",
            position: "top",
          });
          console.log(err);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.profile-picture {
  height: 100%;
  cursor: pointer;
}

.profile-photo-user {
  border-radius: 50%;
  height: 100px;
  width: 100px;
  overflow: hidden;
  margin: auto;
  margin-top: 16px;

  #image-input {
    display: none;
  }
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
  font-weight: 600;
}

.user-profile-img,
.info-button-img,
.user-telephone {
  height: 15px;
  width: 15px;
  margin-top: 13px;
}

.username,
.about-me,
.Phone-no {
  display: flex;
}
.about-user-text {
  padding: 0;
  @media only screen and (max-width: 600px) {
    width: 100%;
  }
}

.profile-name,
.about-user-text,
.phone-no-info {
  font-size: 14px;
  border: none;
  resize: none;
  outline: none;
}

.info-button-img,
.user-telephone {
  height: 15px;
  width: 15px;
}

.logout-button {
  width: 70%;
  height: 30px;
  margin-top: 20px;
  margin-left: 30px;
  margin-right: 30px;
  border-radius: 12px;
  border: 1px;
  background-color: rgb(224, 224, 224);
  cursor: pointer;
}
.profilebio-icon {
  height: 15px;
  margin-left: 5px;
  cursor: pointer;
}
.profile-bio {
  display: flex;
  align-items: center;
  width: 90%;
  @media only screen and (max-width: 600px) {
    width: 100%;
  }
}
.about-me-profile {
  @media only screen and (max-width: 600px) {
    width: 100%;
  }
}
.user-information {
  margin-top: 25px;
}
</style>
