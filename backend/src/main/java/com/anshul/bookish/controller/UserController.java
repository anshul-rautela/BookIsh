package com.anshul.bookish.controller;

import com.anshul.bookish.entity.Users;
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
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<Users>>getAllUsers(){ //or maybe return by converting all users to userResponseDto
        return new ResponseEntity<>(userService.getAllUsers(),HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<UserResponseDto> addUser(@RequestBody UserRequestDto userRequestDto) {
        try {
            Users user = Users.builder()
                    .userName(userRequestDto.getUserName())
                    .email(userRequestDto.getEmail())
                    .name(userRequestDto.getName())
                    .password(userRequestDto.getPassword())
                    .build();
            userService.addUser(user);
            UserResponseDto userResponseDto = user.convertToUserResponse();
            return new ResponseEntity<>(userResponseDto, HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Error: Can't add new Users "+e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable UUID userId){
        Optional<Users> user = userService.getUserById(userId);
        if(user.isPresent()){
            UserResponseDto userResponseDto = user.get().convertToUserResponse();
            return new ResponseEntity<>(userResponseDto, HttpStatus.OK);
        }
        else
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<Users>updateUser(@RequestBody Users user,@PathVariable UUID userId){
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
