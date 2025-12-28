import { CreateUserDto } from '@/user/dto/createUser.dto';
import { IUserResponse } from '@/user/types/userResponse.interface';
import { UserEntity } from '@/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { LoginUserDto } from '@/user/dto/loginUser.dto';
import { compare } from 'bcrypt';
import { UpdateUserDto } from '@/user/dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}
  async createUser(createUserDto: CreateUserDto): Promise<IUserResponse> {
    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);

    const userByEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (userByEmail) {
      throw new HttpException('User with this email already exists', 400);
    }

    const userByUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (userByUsername) {
      throw new HttpException('User with this username already exists', 400);
    }

    const savedUser = await this.userRepository.save(newUser);
    return this.generateUserResponse(savedUser);
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
    });

    if (!user) {
      throw new HttpException('User does not exist.', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await compare(loginUserDto.password, user.password);

    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    delete user.password;
    return user;
  }

  async findUserById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.findUserById(userId);
    Object.assign(user, updateUserDto);

    return await this.userRepository.save(user);
  }

  generateUserResponse(user: UserEntity): IUserResponse {
    return {
      user: {
        ...user,
        token: this.generateToken(user),
      },
    };
  }

  generateToken(user: UserEntity): string {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const generatedToken = sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return generatedToken;
  }
}
