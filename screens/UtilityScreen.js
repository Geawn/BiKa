import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, ActivityIndicator 
} from 'react-native';
import { Calendar } from 'react-native-calendars';

const UtilityScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [exchangeRates, setExchangeRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`https://www.vietcombank.com.vn/api/exchangerates?date=${today}`);
      const data = await response.json();
      
      if (data.Data) {
        const filteredRates = data.Data
          .filter(item => ['USD', 'EUR', 'GBP', 'JPY', 'HKD', 'AUD', 'NZD', 'CAD', 'SGD', 'THB', 'KRW'].includes(item.currencyCode))
          .map(item => ({
            currency: item.currencyCode,
            rate: parseFloat(item.sell).toFixed(2)
          }));

        setExchangeRates(filteredRates);
        setLastUpdated(new Date(data.UpdatedDate).toLocaleDateString('vi-VN'));
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingBottom: 100 }}
      bounces={true}
      overScrollMode="always"
    >
      <Text style={styles.header}>Tiện ích</Text>

      {/* Lịch Việt */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LỊCH VIỆT</Text>
        <View style={styles.calendarHeader}>
          <Text style={styles.dayName}>
            {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long' }).toUpperCase()}
          </Text>
          <Text style={styles.dateNumber}>{selectedDate.getDate()}</Text>
          <Text style={styles.monthYear}>
            Tháng {selectedDate.getMonth() + 1} - {selectedDate.getFullYear()}
          </Text>
        </View>
        
        <Calendar
          style={styles.calendar}
          current={getLocalDateString(selectedDate)}
          markedDates={{
            [getLocalDateString(selectedDate)]: { selected: true }
          }}
          onDayPress={day => setSelectedDate(new Date(day.dateString))}
          theme={{
            calendarBackground: '#f3f4ff',
            selectedDayBackgroundColor: '#4f46e5',
            selectedDayTextColor: '#fff',
            todayTextColor: '#4f46e5',
            dayTextColor: '#1e293b',
            textDisabledColor: '#94a3b8',
            dotColor: '#4f46e5',
            selectedDotColor: '#fff',
            arrowColor: '#4f46e5',
            monthTextColor: '#4f46e5',
            textDayFontWeight: '500',
            textMonthFontWeight: '700',
            textDayHeaderFontWeight: '500',
            textDayFontSize: 14,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
        />
      </View>

      {/* Tỷ giá ngoại tệ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>THAM KHẢO TỶ GIÁ</Text>
        <Text style={styles.updateDate}>Cập nhật ngày {lastUpdated || '...'} </Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#4f46e5" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.ratesContainer}>
            <View style={styles.ratesHeader}>
              <Text style={styles.ratesHeaderText}>Ngoại tệ</Text>
              <Text style={styles.ratesHeaderText}>Tỷ giá bán (VND)</Text>
            </View>
            
            {exchangeRates.map((item, idx) => (
              <View key={idx} style={styles.rateRow}>
                <Text style={styles.currencyText}>{item.currency}</Text>
                <Text style={styles.rateText}>
                  {Number(item.rate).toLocaleString('vi-VN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4ff',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    color: '#4f46e5',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#4f46e5',
  },
  calendarHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  dateNumber: {
    fontSize: 44,
    fontWeight: '700',
    color: '#4f46e5',
    marginVertical: 4,
  },
  monthYear: {
    fontSize: 14,
    color: '#64748b',
  },
  calendar: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  updateDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
    fontWeight: '500',
  },
  ratesContainer: {
    marginTop: 8,
  },
  ratesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e7ff',
    marginBottom: 12,
  },
  ratesHeaderText: {
    fontWeight: '700',
    color: '#4f46e5',
    fontSize: 14,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2ff',
  },
  currencyText: {
    color: '#1e293b',
    fontWeight: '600',
    fontSize: 16,
  },
  rateText: {
    color: '#4f46e5',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default UtilityScreen;
