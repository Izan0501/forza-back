import { IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateNutritionDto {
  @IsString()
  @MinLength(3)
  mealPlan: string;

  @IsNumber()
  @IsPositive()
  calorieGoal: number;

  @IsNumber()
  @IsPositive()
  waterIntake: number;

  @IsOptional()
  @IsString()
  tips?: string;
}
