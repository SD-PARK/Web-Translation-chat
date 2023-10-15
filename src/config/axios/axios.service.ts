import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class AxiosService {
    async get(url: string): Promise<AxiosResponse> {
        try { return await axios.get(url); }
        catch(err) { throw err; }
    }

    async post(url: string, data: any, config: AxiosRequestConfig<any>): Promise<AxiosResponse> {
        try { return await axios.post(url, data, config); }
        catch(err) { throw err; }
    }

    async put(url: string, data: any): Promise<AxiosResponse> {
        try { return await axios.put(url, data); }
        catch(err) { throw err; }
    }

    async delete(url: string): Promise<AxiosResponse> {
        try { return await axios.delete(url); }
        catch(err) { throw err; }
    }
}
