import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { _403, _404 } from '../../common/constants/errors';
import { Repository } from 'typeorm';
import { UserType } from '../../common/constants/enums';
import { Transaction } from '../smart-contract/entities/transaction.entity';
import { CreatePatientDto, PatientResponseDto } from './dto/patient.dto';
import { Patient } from './entities/patient.entity';

@Injectable()
export class PatientSvcService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  /**
   * This function is used to register a patient account
   */
  async registerPatient(patientDto: CreatePatientDto): Promise<Patient> {
    // Check if patient already exists
    const patientExists = await this.patientRepository.findOne({
      where: { phoneNumber: patientDto.phoneNumber },
    });

    if (patientExists)
      throw new ForbiddenException(_403.PATIENT_ALREADY_EXISTS);

    const patient = this.patientRepository.create(patientDto);
    return await this.patientRepository.save(patient);
  }

  /**
   * This function is used to find a patient by his/her phone number
   */
  async findPatientByPhoneNumber(
    phoneNumber: string,
  ): Promise<PatientResponseDto[]> {
    const patient = await this.patientRepository.findOne({
      where: { phoneNumber },
    });

    if (!patient) throw new NotFoundException(_404.PATIENT_NOT_FOUND);

    const { phoneNumber: phone, firstName, lastName, email, id } = patient;

    return [
      {
        phoneNumber: phone,
        firstName,
        lastName,
        email,
        id,
      },
    ] as PatientResponseDto[];
  }

  /**
   * This function is used to find a patient list  by payerId
   */
  async findAllPatientByPayerId(
    payerId: string,
  ): Promise<PatientResponseDto[]> {
    const uniquePatientIdsQuery = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('transaction.ownerId', 'ownerId')
      .where('transaction.senderId = :payerId', { payerId })
      .andWhere('transaction.ownerId IS NOT NULL')
      .andWhere('transaction.ownerType = :ownerType', {
        ownerType: UserType.PATIENT,
      })
      .groupBy('transaction.ownerId')
      .getRawMany();

    const uniquePatientIds = uniquePatientIdsQuery.map(
      (result) => result.ownerId,
    );

    const patients = await this.patientRepository
      .createQueryBuilder('patient')
      .whereInIds(uniquePatientIds)
      .getMany();

    return patients.map((patient) => {
      const { user, ...data } = patient;
      return {
        ...data,
      };
    }) as PatientResponseDto[];
  }
}
