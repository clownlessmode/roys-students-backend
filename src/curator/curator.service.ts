import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCuratorDto } from './dto/create-curator.dto';
import { UpdateCuratorDto } from './dto/update-curator.dto';
import { Curator } from './entities/curator.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class CuratorService {
  constructor(private manager: EntityManager) {}

  async create(dto: CreateCuratorDto): Promise<Curator> {
    const curator = this.manager.create(Curator, dto);
    return await this.manager.save(Curator, curator);
  }

  async findMany(): Promise<Curator[]> {
    return await this.manager.find(Curator);
  }

  async findOne(id: string): Promise<Curator> {
    try {
      return await this.manager.findOneOrFail(Curator, { where: { id } });
    } catch (error) {
      throw new NotFoundException(`Преподаватель с ID ${id} не найден`);
    }
  }

  async update(
    id: string,
    updateCuratorDto: UpdateCuratorDto,
  ): Promise<Curator> {
    const curator = await this.findOne(id);

    // Обновление полей
    Object.assign(curator, updateCuratorDto);

    return await this.manager.save(Curator, curator);
  }

  async remove(id: string): Promise<void> {
    const curator = await this.findOne(id);
    await this.manager.remove(Curator, curator);
  }
}
