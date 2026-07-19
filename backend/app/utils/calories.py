from app.models.user import User


def calculate_bmr(user: User) -> float:
    """Mifflin St Jeor Equation"""
    if user.gender == "male":
        return (10 * user.weight) + (6.25 * user.height) - (5 * user.age) + 5
    else:
        return (10 * user.weight) + (6.25 * user.height) - (5 * user.age) - 161


def calculate_tdee(user: User) -> float:
    activity_multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9,
    }
    bmr = calculate_bmr(user)
    multiplier = activity_multipliers.get(user.activity, 1.2)
    return bmr * multiplier


def get_target_calorie(user: User) -> float:
    tdee = calculate_tdee(user)
    if user.goal == "lose":
        return tdee - 500
    elif user.goal == "gain":
        return tdee + 300
    return tdee
