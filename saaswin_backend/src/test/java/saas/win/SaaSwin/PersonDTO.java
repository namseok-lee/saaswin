package saas.win.SaaSwin;

public class PersonDTO {
    private String name;
    private int age;

    // 생성자
    public PersonDTO(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // Getter, Setter
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    @Override
    public String toString() {
        return "PersonDTO{name='" + name + "', age=" + age + '}';
    }
}
