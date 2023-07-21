import { Test, TestingModule } from '@nestjs/testing';
import { AxiosService } from './axios.service';

describe('AxiosService', () => {
  let axiosService: AxiosService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AxiosService],
    }).compile();

    axiosService = module.get<AxiosService>(AxiosService);
  });

  it('should be defined', () => {
    expect(axiosService).toBeDefined();
  });

  describe('Get', () => {
  });

  describe('Post', () => {

  });

  describe('Put', () => {

  });

  describe('Delete', () => {

  });
});
