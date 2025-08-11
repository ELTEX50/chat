from django import template
from django.utils import timezone
import jdatetime

register = template.Library()

@register.filter
def getattr_filter(obj, attr):
    """
    Get an attribute of an object dynamically.
    
    Usage:
        {{ result|getattr_filter:field }}
    """
    if hasattr(obj, attr):
        return getattr(obj, attr)
    return None

@register.filter
def jalali_date(value, format_string="%Y/%m/%d"):
    """
    Convert a datetime object to Jalali date format.
    
    Usage:
        {{ user.date_joined|jalali_date }}
        {{ user.date_joined|jalali_date:"%Y/%m/%d %H:%M" }}
    """
    if value is None:
        return ""
    
    # Convert to timezone-aware datetime if it's naive
    if timezone.is_naive(value):
        value = timezone.make_aware(value)
    
    # Convert to Jalali date
    jalali_date = jdatetime.datetime.fromgregorian(datetime=value)
    
    # Format the date
    return jalali_date.strftime(format_string)

@register.filter
def jalali_date_verbose(value):
    """
    Convert a datetime object to verbose Jalali date format in Persian.
    
    Usage:
        {{ user.date_joined|jalali_date_verbose }}
    """
    if value is None:
        return ""
    
    # Convert to timezone-aware datetime if it's naive
    if timezone.is_naive(value):
        value = timezone.make_aware(value)
    
    # Convert to Jalali date
    jalali_date = jdatetime.datetime.fromgregorian(datetime=value)
    
    # Persian month names
    persian_months = {
        1: "فروردین",
        2: "اردیبهشت", 
        3: "خرداد",
        4: "تیر",
        5: "مرداد",
        6: "شهریور",
        7: "مهر",
        8: "آبان",
        9: "آذر",
        10: "دی",
        11: "بهمن",
        12: "اسفند"
    }
    
    # Persian day names
    persian_days = {
        0: "شنبه",
        1: "یکشنبه",
        2: "دوشنبه", 
        3: "سه‌شنبه",
        4: "چهارشنبه",
        5: "پنج‌شنبه",
        6: "جمعه"
    }
    
    year = jalali_date.year
    month = persian_months[jalali_date.month]
    day = jalali_date.day
    weekday = persian_days[jalali_date.weekday()]
    
    return f"{weekday} {day} {month} {year}" 