package com.anshul.bookish.controller;

import com.anshul.bookish.entity.User;
import com.anshul.bookish.entity.UserRequestDto;
import com.anshul.bookish.entity.UserResponseDto;
import com.anshul.bookish.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RestController("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<User>>getAllUsers(){ //or maybe return by converting all users to userResponseDto
        return new ResponseEntity<>(userService.getAllUsers(),HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<UserResponseDto> addUser(@RequestBody UserRequestDto userRequestDto) {
        try {
            User user = User.builder()
                    .userName(userRequestDto.getUserName())
                    .email(userRequestDto.getEmail())
                    .name(userRequestDto.getName())
                    .password(userRequestDto.getPassword())
                    .build();
            userService.addUser(user);
            UserResponseDto userResponseDto = user.convertToUserResponse();
            return new ResponseEntity<>(userResponseDto, HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Error: Can't add new User "+e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable UUID userId){
        Optional<User> user = userService.getUserById(userId);
        if(user.isPresent()){
            UserResponseDto userResponseDto = user.get().convertToUserResponse();
            return new ResponseEntity<>(userResponseDto, HttpStatus.OK);
        }
        else
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<User>updateUser(@RequestBody User user,@PathVariable UUID userId){
        user.setId(userId);
        user = userService.updateUser(user);
        return new ResponseEntity<>(user,HttpStatus.OK);
    }
    @DeleteMapping("/{userId}")
    public ResponseEntity<?>deleteUser(@PathVariable UUID userId){
        userService.deleteUserById(userId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

}
