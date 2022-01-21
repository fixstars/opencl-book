---
description: >-
  Chapter 4 discussed the basic concepts required to write a simple OpenCL
  program. This chapter will go further in depth, allowing for a more a flexible
  and optimized OpenCL program.
---

# OpenCL C

OpenCL C language is basically standard C (C99) with some extensions and restrictions. This language is used to program the kernel. Aside from these extensions and restrictions, the language can be treated the same as C. **List 5.1** shows a simple function written in OpenCL C.

**List 5.1: OpenCL C Sample Code**

```
int sum(int *a, int n)
{ /* Sum every component in array "a" */
    int sum = 0;
    for (int i = 0; i < n; i++)
    {
        sum += a[i];
    }
    return sum;
}
```

## _Restrictions_

Below lists the restricted portion from the C language in OpenCL C.

• The pointer passed as an argument to a kernel function must be of type \_\_global, \_\_constant, or \_\_local.

• Pointer to a pointer cannot be passed as an argument to a kernel function.

• Bit-fields are not supported.

• Variable length arrays and structures with flexible (or unsized) arrays are not supported.

• Variadic macros and functions are not supported.

• C99 standard headers cannot be included

• Recursion is not supported. 

• The auto and register storage-class specifiers are not supported.

• The function using the \_\_kernel qualifier can only have return type void in the source code.

• Support for double precision floating-point is currently an optional extension. It may or may not be implemented.

## _Address Space Qualifiers_

OpenCL supports 4 memory types: global, constant, local, and private. In OpenCL C, these address space qualifiers are used to specify which memory on the device to use. The memory type corresponding to each address space qualifiers are shown in **Table 5.1**.

**Table 5.1: Address Space Qualifiers and their corresponding memory**

| Qualifier                   | Corresponding memory  |
| --------------------------- | --------------------- |
| \_\_global (or global)      | Global memory         |
| \_\_local (or local)        | Local memory          |
| \_\_private (or private)    | Private memory        |
| \_\_constant (or constant)  | Constant memory       |

The "\_\_" prefix is not required before the qualifiers, but we will continue to use the prefix in this text for consistency. If the qualifier is not specified, the variable gets allocated to "\_\_private", which is the default qualifier. A few example variable declarations are given in **List 5.2**.

**List 5.2: Variables declared with address space qualifiers**

```
__global int global_data[128]; // 128 integers allocated on global memory 
__local float *lf; // pointer placed on the private memory, which points to a single-precision float located on the local memory 
__global char * __local lgc[8]; // 8 pointers stored on the local memory that points to a char located on the global memory 
```

The pointers can be used to read address in the same way as in standard C. Similarly, with the exception for "\_\_constant" pointers, the pointers can be used to write to an address space as in standard C.

A type-cast using address space qualifiers is undefined. Some implementation allows access to a different memory space via pointer casting, but this is not the case for all implementations.

## _Built-in Function_

OpenCL contains several built-in functions for scalar and vector operations. These can be used without having to include a header file or linking to a library. A few examples are shown below.

• **Math Functions**

Extended version of math.h in C. Allows usage of functions such as sin(), log(), exp().

• **Geometric Functions**

Includes functions such as length(), dot().

• **Work-Item Functions**

Functions to query information on groups and work-items. Get\_work\_dim(), Get\_local\_size() are some examples.

Refer to chapter 8 for a full listing of built-in functions.

**List 5.3** below shows an example of a kernel that uses the sin() function. Note that header files do not have to be included.

**List 5.3: Kernel that uses sin()**

```
__kernel void runtest(__global float *out, __global float *in)
{
    for (int i = 0; i < 16; i++)
    {
        out[i] = sin(in[i] / 16.0f);
    }
}
```

Many built-in functions are overloaded. A function is said to be overloaded if the same function name can be used to call different function definitions based on the arguments passed into that function. For example, the sin() function is overloaded such that the precision of the returned value depends on whether a float or a double value is passed in as an argument, since different functions exist for each of the passed in data-types. In OpenCL, most math functions are overloaded, reducing the need for functions such as sinf() in standard C. An example of calls to overloaded functions is shown in **List 5.4** below.

**List 5.4: Calls to overloaded functions**

```
__kernel void runtest(__global float *out, __global float *in_single, __global double *in_double)
{
    for (int i = 0; i < 16; i++)
    {
        float sf = sin(in_single[i]);  /* The float version is called */
        double df = sin(in_double[i]); /* The double version is called */
    }
}
```

## _Vector Data_

OpenCL defines vector data-types, which is basically a struct consisting of many components of the same data-type. **Figure 5.1** shows some example of vector data-types.

**Figure 5.1: Vector data-type examples**

![](<../.gitbook/assets/Screen_Shot_2022-01-05_at_9.09.54_AM.png>)

Each component in the vector is referred to as a scalar-type. A group of these scalar-type values defines a vector data-type.

Recent CPUs contain compute units called SIMD, which allows numerous data to be processed using one instruction. Usage of these SIMD units can accelerate some processes by many folds. The use of vector data-types in OpenCL can aid in efficient usage of these SIMD units.

In OpenCL C, adding a number after the scalar type creates a vector type consisting of those scalar types, such as in "int4". Declaring a variable using a vector type creates a variable that can contain the specified number of scalar types. **List 5.5** shows examples of declaring vector-type variables.

**List 5.5: Vector-type variable declaration**

> int4 i4; // Variable made up of 4 int values
>
> char2 c2; // Variable made up of 2 char values
>
> float8 f8; // Variable made up of 8 float values

OpenCL defines scalar types char, uchar, short, ushort, int, uint, long, ulong, float, double, and vector-types with size 2, 4, 8, and 16. Vector literals are used to place values in these variables. A vector literal is written as a parenthesized vector type followed by a parenthesized set of expressions. **List 5.6** shows some example usage of vector literals.

**List 5.6: Vector Literal**

> (int4) (1,2,3,4);
>
> (float8) (1.1f, 1.2f, 1.3f, 1.4f, 1.5f, 1.6f, 1.7f, 1.8f);
>
> (int8) ((int2)(1,2), (int2)(3,4), (int4)(5,6,7,8));

The number of values set in the vector literals must equal the size of the vector.

The built-in math functions are overloaded such that an component-by-component processing is allowed for vector-types. Functions such as sin() and log() performs these operations on each component of the vector-type.

> float4 g4 = (float4)(1.0f, 2.0f, 3.0f, 4.0f);
>
> float4 f4 = sin(g4);

The above code performs the operation shown below.

> float4 g4 = (float4)(1.0f, 2.0f, 3.0f, 4.0f);
>
> float4 f4 = (float4)(sin(1.0f), sin(2.0f), sin(3.0f), sin(4.0f));

The vector component can be accessed by adding an extension to the variable. This can be done by adding .xyzw, accessing by number, or by odd/even/hi/lo.

• ".xyzw" accesses indices 0 through 3. It cannot access higher indices.

• The vector can be accessed via a number index using ".s" followed by a number. This number is in hex, allowing access to up to 16 elements by using a\~f or A\~F for indices above 9.

• ".odd" extracts the odd indices, and ".even" extracts the even indices. ".hi" extracts the upper half of the vector, and ".lo" extracts the lower half of the vector.

**List 5.7** shows a few examples of component accesses.

**List 5.7: Vector component access**

> int4 x = (int4)(1, 2, 3, 4);
>
> int4 a = x.wzyx; /\* a = (4, 3, 2, 1) \*/
>
> int2 b = x.xx; /\* b = (1, 1) \*/
>
> int8 c = x.s01233210; /\* c = (1, 2, 3, 4, 4, 3, 2, 1) \*/
>
> int2 d = x.odd; /\* d = (2, 4) \*/
>
> int2 e = x.hi; /\* e = (3, 4) \*/

We will now show an example of changing the order of data using the introduced concepts. **List 5.8** shows a kernel code that reverses the order of an array consisting of 16 components.

**List 5.8: Reverse the order of a 16-element array**

```
__kernel void runtest(__global float *out, __global float *in)
{
    __global float4 *in4 = (__global float4 *)in;
    __global float4 *out4 = (__global float4 *)out;
    for (int i = 0; i < 4; i++)
    {
        out4[3 - i] = in4[i].s3210;
    }
}
```

• 002\~003: Type cast allow access as a vector type

• 004: Each loop processes 4 elements. The loop is run 4 times to process 16 elements.

• 005: Vector component access by index number.

Some operators are overloaded to support arithmetic operation on vector types. For these operations, arithmetic operation is performed for each component in the vector. An example is shown in **Figure 5.2**.

**Figure 5.2: Addition of 2 vector-types**

![](<../.gitbook/assets/Screen_Shot_2022-01-05_at_9.16.31_AM.png>)

In general, the vector operation would be the same for each component, with the exception to comparison and ternary selection operations. The results of comparison and selection operations are shown in the sections to follow.

## **Comparison Operations**

When 2 scalar-types are compared using <, <=, >, >=, !=, ==, an integer value of either 0 or 1 is returned. When 2 vector-types are compared, a vector type (not necessarily the same as the vector-types being compared) is returned, with each vector component having a TRUE or FALSE value. For example, a comparison of two-float4 types returns an int4 type. The operand types and the returned vector-type after a comparison are shown in **Table 5.2** below.

**Table 5.2: Resulting vector-type after a comparison**

| Operand type         | Type after comparison  |
| -------------------- | ---------------------- |
| char, uchar          | char                   |
| short, ushort        | short                  |
| int, uint, float     | int                    |
| long, ulong, double  | long                   |

Also, if the comparison is FALSE, a 0 (all bits are 0) is returned like usual, but if it is TRUE, a -1 (all bits are 1) is returned.

> int4 tf = (float4)(1.0f, 1.0f, 1.0f, 1.0f) == (float4)(0.0f, 1.0f, 2.0f, 3.0f);
>
> // tf = (int4)(0, -1, 0, 0)

A 0/-1 is returned instead of 0/1, since it is more convenient when using SIMD units. Since SIMD operation performs the same operation on different data in parallel, branch instructions should be avoided when possible. For example, in the code shown in **List 5.9**, the branch must be performed for each vector component serially, which would not use the SIMD unit effectively.

**List 5.9: Branch process**

> // "out" gets the smaller of "in0" and "in1" for each component in the vector
>
> int a = in0\[i], b = in1\[i];
>
> if (a\<b) out\[i] = a;
>
> else out\[i] = b;

Since a "-1" is returned when the condition is TRUE, the code in **List 5.9** can be replaced by the code in **List 5.10** that does not use a branch.

**List 5.10: List 5.9 rewritten without the branch**

> // "out" gets the smaller of "in0" and "in1" for each component in the vector
>
> int a = in0\[i], b = in1\[i];
>
> int cmp = a < b; // If TRUE, cmp=0xffffffff. If FALSE, cmp=0x00000000;
>
> out\[i] = (a & cmp) | (b & \~cmp); // a when TRUE and b when FALSE

In this case, the SIMD unit is used effectively, since each processing elements are running the same set of instructions.

To summarize, branch instruction should be taken out to use SIMD units, and to do this, it is much more convenient to have the TRUE value to be -1 instead of 1.

On a side note, OpenCL C language has a built-in function bitselect(), which can rewrite the line

> out\[i] = (a & cmp) | (b & \~cmp) // a when TRUE and b when FALSE

with the line

> out\[i] = bitselect(cmp, b, a);

## **Ternary Selection Operations**

The difference in comparison operation brings about a difference in ternary selection operations as well. In a selection operation, if the statement to the left of "?" evaluates to be FALSE, then the value between the "?" and ":" is selected, and if it evaluates to be TRUE, then the value to the right of ":" is selected. Using this operation, the code from **List 5.10** can be rewritten as the code shown in **List 5.11**.

**List 5.11: Ternary Selection Operator Usage Example**

> // "out" gets the smaller of "in0" and "in1" for each component in the vector
>
> int a = in0\[i], b = in1\[i];
>
> out\[i] = a\<b ? a : b; // a when TRUE and b when FALSE



| Column - Should you use a vector-type?                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| <p>The OpenCL C language defines vector type, but it does not specify how its operations are implemented. Since not all processors contain SIMD units, (for example, NVIDIA GPU), and when vector operations are performed on these processors, the operations will be performed sequentially for each scalars. Also, large vector-types such as double16 may fill up the hardware register, resulting in slower execution. In these cases, the operation will not benefit from using a vector type. In fact, the compiler should take care of deciding on the vector length to use the SIMD unit for optimal performance. </p><p></p><p>However, compilers are still not perfect, and auto-vectorization is still under development. Thus, the optimization to effectively use SIMD units is placed on the hands of the programmers. </p><p></p><p>Starting with OpenCL 1.1, clGetDeviceInfo can be used to retrieve the vector length supported by the hardware. Refer to chapter 8 for more details. </p> |

## _Half_

OpenCL C language defines a 16-bit floating point type referred to as "half". One bit is used for sign, 5 bits are used for exponent, and the remaining 10 bits are used as the mantissa (also known as significant or coefficient). **Figure 5.3** shows the bit layout of a half-type.

**Figure 5.3: Bit layout of "half"**

![](<../.gitbook/assets/Screen Shot 2022-01-06 at 9.42.51 AM.png>)

The "half" type is not as well known as 32-bit floats or 64-bit doubles, but this type is defined as a standard in IEEE 754.

In OpenCL C, the half data type is used for loading and storing, but implementation of arithmetic operations between half data types are optional. Read/write of half values are defined as built-in functions, which can be used to convert half to float for reading, or float to half for writing.

**List 5.12** shows a program which performs arithmetic operation between vectors of halfs.

**List 5.12: Arithmetic Operation between half values**

```
__kernel void add_half(__global half *out, __global half *x, __global half *y, int n)
{
    int i;
    for (i = 0; i < n; i++)
    {
        float xf = vload_half(i, x);
        float yf = vload_half(i, y);
        vstore_half(xf + yf, i, out);
    }
}
```

## _OpenCL variable types_

Some defined types in OpenCL C may differ, and some types may not be defined in the standard C language. A list of types defined in OpenCL C as well as their bit widths are shown in **Table 5.3** below.



| **Table 5.3: OpenCL variable types** Data types  | Bit width  | Remarks                    |
| ------------------------------------------------ | ---------- | -------------------------- |
| bool                                             | Undefined  |                            |
| char                                             | 8          |                            |
| unsigned char, uchar                             | 8          |                            |
| short                                            | 16         |                            |
| unsigned short, ushort                           | 16         |                            |
| int                                              | 32         |                            |
| unsigned int, uint                               | 32         |                            |
| long                                             | 64         |                            |
| unsigned long, ulong                             | 64         |                            |
| float                                            | 32         |                            |
| double                                           | 64         | Supported from OpenCL 1.2  |
| half                                             | 16         |                            |
| size\_t                                          | \*         | stddef.h not required      |
| ptrdiff\_t                                       | \*         | stddef.h not required      |
| intptr\_t                                        | \*         | stddef.h not required      |
| uintptr\_t                                       | \*         | stddef.h not required      |
| void                                             | -          |                            |

\* Should be the same as the value returned by clGetDeviceInfo for CL\_DEVICE\_ADDRESS\_BITS.

## _Rounding of floats_

When a float is casted to integer, or when a double is casted to a float, rounding must take place from the lack of available bits. **Table 5.4** shows a listing of situations when rounding occurs, as well what how the numbers are rounded in each of the situations.

**Table 5.4: OpenCL C Rounding**

| Operation                       | Rounding Method                                                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Floating point arithmetic       | Round to nearest even by default. Others may be set as an option. The default may not be round to nearest even for Embedded Profiles  |
| Builtin functions               | Round to nearest even only                                                                                                            |
| Cast from float to int          | Round towards zero only                                                                                                               |
| Cast from int to float          | Same as for floating point arithmetic                                                                                                 |
| Cast from float to fixed point  | Same as for floating point arithmetic                                                                                                 |

Type casting can be performed in the same way as in standard C. Explicit conversion can also be performed, which allows for an option of how the number gets rounded.

The explicit conversion can be done as follows.

> convert\_\<type>\[\_\<rounding>]\[\_sat]

\<type> is the variable type to be converted to. \<rounding> sets the rounding mode. "\_sat" can be used at the end to saturate the value when the value is above the max value or below the minimum value. \<rounding> gets one of the rounding mode shown in **Table 5.5**. If this mode is not set, than the rounding method will be the same as for type casting.

**Table 5.5: Explicit specification of the rounding mode**

| Rounding mode  | Rounding toward  |
| -------------- | ---------------- |
| rte            | Nearest even     |
| rtz            | 0                |
| rtp            | +∞               |
| rtn            | -∞               |

**List 5.13** shows an example where floats are explicitly converted to integers using different rounding modes.

**List 5.13: Rounding example**

```
__kernel void round_xyzw(__global int *out, __global float *in)
{
    out->x = convert_int_rte(in->x); // Round to nearest even
    out->y = convert_int_rtz(in->y); // Round toward zero
    out->z = convert_int_rtn(in->z); // Round toward -∞
    out->w = convert_int_rtp(in->w); // Round toward ∞
}
```

## _Bit Reinterpreting_

In OpenCL the union() function can be used to access the bits of a variable. **List 5.14** shows the case where it is used to look at the bit value of a float variable.

**List 5.14: Get bit values using union**

```
// Get bit values of a float
int float_int(float a)
{
    union
    {
        int i, float f;
    } u;
    u.f = a;
    return u.i;
}
```

The action of the above code using standard C is not defined, but when using OpenCL C, the bits of the float can be reinterpreted as an integer. OpenCL includes several built-in functions that make this reinterpretation easier. The function has the name "as\_\<type>", and is used to reinterpret a variable as another type without changing the bits.

**List 5.15** shows an example where the "as\_int()" function is called with a 32-bit float as an argument.

**List 5.15: Reinterpretation using as\_int()**

```
// Get the bit pattern of a float
int float_int(float a)
{
    return as_int(a);
}

// 0x3f800000（=1.0f）
int float1_int(void)
{
    return as_int(1.0f);
}
```

Reinterpretation cannot be performed, for example, between float and short, where the number of bits is different. Reinterpretation between short4 and int2, where the total number of bits is the same, is undefined and the answer may vary depending on the OpenCL implementation.

## _Local Memory_

We have mentioned the OpenCL memory hierarchy from time to time so far in this text. OpenCL memory and pointer seems complicated when compared to the standard C language. This section will discuss the reason for the seemingly-complex memory hierarchy, as well as one of the memory types in the hierarchy, called the local memory.

There are two main types of memory. One is called SRAM (Static RAM) and the other is called DRAM (Dynamic RAM). SRAM can be accessed quickly, but cannot be used throughout due to cost and the complex circuitry. DRAM on the other hand is cheap, but cannot be accessed quickly as in the case for SRAM. In most computers, the frequently-used data uses the SRAM, while less frequently-used data is kept in the DRAM. In CPU, the last accessed memory content is kept in cache located in the memory space near the CPU. The cache is the SRAM in this case.

This cache memory may not be implemented for processors such as GPU and Cell/B.E., where numerous compute units are available. This is mainly due to the fact that caches were not of utmost necessity for 3D graphics, for which the processor was designed for, and that cache hardware adds complexity to the hardware to maintain coherency.

Processors that do not have cache hardware usually contain a scratch-pad memory in order to accelerate memory access. Some examples of scratch-pad memory include shared memory on NVIDIA's GPU, and local storage on Cell/B.E.

The advantage of using these scratch-pad memories is that it keeps the hardware simple since the coherency is maintained via software rather than on the cache hardware. Also, memory space can be made smaller than cache memory, since the memory content can be altered as needed via the software. One disadvantage is that everything has to be managed by the software.

OpenCL calls these scratch-pad memory "local memory"12. Local memory can be used by inserting the "\_\_local" qualifier before a variable declaration. **List 5.16** shows some examples of declaring variables to be stored on the local memory. Local memory is allocated per work-group. Work-items within a work-group can use the same local memory. Local memory that belongs to another work-group may not be accessed.

**List 5.16: Declaring variables on the local memory**

> \_\_local int lvar; // Declare lvar on the local memory
>
> \_\_local int larr\[128]; // Declare array larr on the local memory
>
> \_\_local int \*ptr; // Declare a pointer that points to an address on the local memory

The local memory size must be taken into account, since this memory was made small in order to speed up access to it. Naturally, memory space larger than the memory space cannot be allocated. The size of the local memory space that can be used on a work-group can be found by using the clGetDeviceInfo function, passing CL\_DEVICE\_LOCAL\_MEM\_SIZE as an argument. The local memory size depends on the hardware used, but it is typically between 10 KB and a few hundred KB. OpenCL expects at least 16 KB of local memory.

Since this memory size varies depending on the hardware, there may be cases where you may want to set the memory size at runtime. This can be done by passing in an appropriate value to the kernel via clSetKernelArg(). **List 5.17** and List **5.18** shows an example where the local memory size for a kernel is specified based on the available local memory on the device. The available local memory is retrieved using the clGetDeviceInfo function, and each kernel is given half of the available local memory.

**List 5.17: Set local memory size at runtime (kernel)**

```
__kernel void local_test(__local char *p, int local_size)
{
    for (int i = 0; i < local_size; i++)
    {
        p[i] = i;
    }
}
```

**List 5.18: Set local memory size at runtime (host)**

```
#include <stdlib.h>
#ifdef __APPLE__
#include <OpenCL/opencl.h>
#else
#include <CL/cl.h>
#endif
#include <stdio.h>

#define MAX_SOURCE_SIZE (0x100000)

int main()
{
    cl_platform_id platform_id = NULL;
    cl_uint ret_num_platforms;
    cl_device_id device_id = NULL;
    cl_uint ret_num_devices;
    cl_context context = NULL;
    cl_command_queue command_queue = NULL;
    cl_program program = NULL;
    cl_kernel kernel = NULL;
    size_t kernel_code_size, local_size_size;
    char *kernel_src_str;
    cl_int ret;
    FILE *fp;
    cl_ulong local_size;
    cl_int cl_local_size;
    cl_event ev;

    clGetPlatformIDs(1, &platform_id, &ret_num_platforms);
    clGetDeviceIDs(platform_id, CL_DEVICE_TYPE_DEFAULT, 1, &device_id,
                   &ret_num_devices);
    context = clCreateContext(NULL, 1, &device_id, NULL, NULL, &ret);

    command_queue = clCreateCommandQueue(context, device_id, 0, &ret);
    fp = fopen("local.cl", "r");
    kernel_src_str = (char *)malloc(MAX_SOURCE_SIZE);
    kernel_code_size = fread(kernel_src_str, 1, MAX_SOURCE_SIZE, fp);
    fclose(fp);

    /* Get available local memory size */
    clGetDeviceInfo(device_id, CL_DEVICE_LOCAL_MEM_SIZE, sizeof(local_size), &local_size, &local_size_size);
    printf("CL_DEVICE_LOCAL_MEM_SIZE = %d¥n", (int)local_size);

    /* Build Program */
    program = clCreateProgramWithSource(context, 1, (const char **)&kernel_src_str,
                                        (const size_t *)&kernel_code_size, &ret);
    clBuildProgram(program, 1, &device_id, "", NULL, NULL);
    kernel = clCreateKernel(program, "local_test", &ret);

    cl_local_size = local_size / 2;

    /* Set kernel argument */
    clSetKernelArg(kernel, 0, cl_local_size, NULL);
    clSetKernelArg(kernel, 1, sizeof(cl_local_size), &cl_local_size);

    /* Execute kernel */
    ret = clEnqueueTask(command_queue, kernel, 0, NULL, &ev);
    if (ret == CL_OUT_OF_RESOURCES)
    {
        puts("too large local");
        return 1;
    }
    /* Wait for the kernel to finish */
    clWaitForEvents(1, &ev);

    clReleaseKernel(kernel);
    clReleaseProgram(program);
    clReleaseCommandQueue(command_queue);
    clReleaseContext(context);

    free(kernel_src_str);

    return 0;
}
```

We will now go through the above code, starting with the kernel code.

> 001: \_\_kernel void local\_test(\_\_local char \*p, int local\_size) {

The kernel receives a pointer to the local memory for dynamic local memory allocation.

> 002: for (int i=0; i < local\_size; i++) {
>
> 003: p\[i] = i;
>
> 004: }

This pointer can be used like any other pointer. However, since the local memory cannot be read by the host program, the value computed in this kernel gets thrown away. In actual programs, data stored on the local memory must be transferred over to the global memory in order to be accessed by the host.

We will now look at the host code.

> 039: /\* Get available local memory size \*/
>
> 040: clGetDeviceInfo(device\_id, CL\_DEVICE\_LOCAL\_MEM\_SIZE, sizeof(local\_size), \&local\_size, \&local\_size\_size);
>
> 041: printf("CL\_DEVICE\_LOCAL\_MEM\_SIZE = %d¥n", (int)local\_size);

The clGetDeviceInfo() retrieves the local memory size, and this size is returned to the address of "local\_size", which is of the type cl\_ulong.

> 049: cl\_local\_size = local\_size / 2;

The local memory may be used by the OpenCL implementation in some cases, so the actual usable local memory size may be smaller than the value retrieved using clGetDeviceInfo. We are only using half of the available local memory here to be on the safe side.

> 051: /\* Set Kernel Argument \*/
>
> 052: clSetKernelArg(kernel, 0, cl\_local\_size, NULL);

The above code sets the size of local memory to be used by the kernel. This is given in the 3rd argument, which specifies the argument size. The 4th argument is set to NULL, which is the value of the argument.

> 056: ret = clEnqueueTask(command\_queue, kernel, 0, NULL, \&ev);
>
> 057: if (ret == CL\_OUT\_OF\_RESOURCES) {
>
> 058: puts("too large local");
>
> 059: return 1;
>
> 060: }

The kernel is enqueued using clEnqueueTask(). If the specified local memory size is too large, the kernel will not be executed, returning the error code CL\_OUT\_OF\_RESOURCES. For the record, the local memory does not need to be freed.



| Column - Parallel Programming and Memory Hierarchy                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| For those of you new to programming in a heterogeneous environment, you may find the emphasis on memory usage to be a bit confusing and unnecessary (those familiar with GPU or Cell/B.E. probably find most of the content to be rather intuitive).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| <p>However, effective parallel programming essentially boils down to efficient usage of available memory. Therefore, memory management is emphasized in this text. </p><p>This column will go over the basics of parallel programming and memory hierarchy. </p><p>First important fact is that memory access cannot be accelerated effectively through the use of cache on multi-core/many-processor systems, as it had been previously with single cores. A cache is a fast storage buffer on a processor that temporarily stores the previously accessed content of the main memory, so that this content can be accessed quickly by the processor. The problem with this is that with multiple processors, the coherency of the cache is not guaranteed, since the data on the memory can be changed by one processor, while another processor still keeps the old data on cache. </p><p>Therefore, there needs to be a way to guarantee coherency of the cache coherency across multiple processors. This requires data transfers between the processors. </p><p>So how is data transferred between processors? For 2 processors A and B, data transfer occurs between A and B (1 transfer). For 3 processors A, B, and C, data is transferred from A to B, A to C, or B to C (3 transfers). For 4 processors A, B, C, and D, this becomes A to B, A to C, A to D, B to C, B to D, C to D (6 transfers). As the number of processors increase, the number of transfers explodes. The number of processing units (such as ALU), on the other hand, is proportional to the number of processors. This should make apparent of the fact that the data transfer between processors becomes the bottleneck, and not the number of processing units. </p><p>Use of a cache requires the synchronization of the newest content of the main memory, which can be viewed as a type of data transfer between processors. Since the data transfer is a bottleneck in multi-core systems, the use of cache to speed up memory access becomes a difficult task. </p><p>For this reason, the concept of scratch-pad memory was introduced to replace cache, which the programmer must handle instead of depending on the cache hardware. </p><p>On Cell/B.E. SPEs and NVIDIA GPUs, one thing they have in common is that neither of themhave a cache13. Because of this, the memory transfer cost is strictly just the data transfer cost, which reduce the data transfer cost in cache that arises from using multiple processors. </p><p>Each SPE on Cell/B.E. has a local storage space and a hardware called MFC. The transfer between the local storage and the main memory (accessible from all SPE) is controlled in software. The software looks at where memory transfers are taking place in order to keep the program running coherently. </p><p>NVIDIA GPUs do not allow DMA transfer to the local memory (shared memory), and thus data must be loaded from the global memory on the device. When memory access instruction is called, the processor stalls for a few hundred clock cycles, which manifest the slow memory access speed that gets hidden on normal CPUs due to the existence of cache. On NVIDIA GPU, however, a hardware thread is implemented, which allows another process to be performed during the memory access. This can be used to hide the slow memory access speed.  </p><p> </p> |

## _Image Object_

In image processing, resizing and rotation of 2-D images (textures) are often performed, which requires the processing of other pixels in order to produce the resulting image. The complexity of the processing is typically inversely proportional to the clarity of the processed image. For example, real-time 3-D graphics only performs relatively simple processing such as nearest neighbor interpolation and linear interpolation. Most GPUs implement some of these commonly used methods on a hardware called the texture unit.

OpenCL allows the use of these image objects as well as an API to process these image objects. The API allows the texture unit to be used to perform the implemented processes. This API is intended for the existing GPU hardware, which may not be fit to be used on other devices, but the processing may be accelerated if the hardware contains a texture unit.

Image object can be used using the following procedure.

1\. Create an image object from the host (clCreateImage2D, clCreateImage3D)

2\. Write data to the image object from the host (clEnqueueWriteImage)

3\. Process the image on the kernel

4\. Read data from the image object on the host (clEnqueueReadImage)

An example code is shown in **List 5.19** and List **5.20** below.

**List 5.19: Kernel (image.cl)**

```
const sampler_t s_nearest = CLK_FILTER_NEAREST | CLK_NORMALIZED_COORDS_FALSE | CLK_ADDRESS_CLAMP_TO_EDGE;
const sampler_t s_linear = CLK_FILTER_LINEAR | CLK_NORMALIZED_COORDS_FALSE | CLK_ADDRESS_CLAMP_TO_EDGE;
const sampler_t s_repeat = CLK_FILTER_NEAREST | CLK_NORMALIZED_COORDS_FALSE | CLK_ADDRESS_REPEAT;

__kernel void
image_test(__read_only image2d_t im,
           __global float4 *out)
{
    /* nearest */
    out[0] = read_imagef(im, s_nearest, (float2)(0.5f, 0.5f));
    out[1] = read_imagef(im, s_nearest, (float2)(0.8f, 0.5f));
    out[2] = read_imagef(im, s_nearest, (float2)(1.3f, 0.5f));

    /* linear */
    out[3] = read_imagef(im, s_linear, (float2)(0.5f, 0.5f));
    out[4] = read_imagef(im, s_linear, (float2)(0.8f, 0.5f));
    out[5] = read_imagef(im, s_linear, (float2)(1.3f, 0.5f));

    /* repeat */
    out[6] = read_imagef(im, s_repeat, (float2)(4.5f, 0.5f));
    out[7] = read_imagef(im, s_repeat, (float2)(5.0f, 0.5f));
    out[8] = read_imagef(im, s_repeat, (float2)(6.5f, 0.5f));
}
```

**List 5.20: Host code (image.cpp)**

```
#include <stdlib.h>
#ifdef __APPLE__
#include <OpenCL/opencl.h>
#else
#include <CL/cl.h>
#endif
#include <stdio.h>

#define MAX_SOURCE_SIZE (0x100000)

int main()
{
    cl_platform_id platform_id = NULL;
    cl_uint ret_num_platforms;
    cl_device_id device_id = NULL;
    cl_uint ret_num_devices;
    cl_context context = NULL;
    cl_command_queue command_queue = NULL;
    cl_program program = NULL;
    cl_kernel kernel = NULL;
    size_t kernel_code_size;
    char *kernel_src_str;
    float *result;
    cl_int ret;
    int i;
    FILE *fp;
    size_t r_size;

    cl_mem image, out;
    cl_bool support;
    cl_image_format fmt;

    int num_out = 9;

    clGetPlatformIDs(1, &platform_id, &ret_num_platforms);
    clGetDeviceIDs(platform_id, CL_DEVICE_TYPE_DEFAULT, 1, &device_id,
                   &ret_num_devices);
    context = clCreateContext(NULL, 1, &device_id, NULL, NULL, &ret);
    result = (float *)malloc(sizeof(cl_float4) * num_out);

    /* Check if the device support images */
    clGetDeviceInfo(device_id, CL_DEVICE_IMAGE_SUPPORT, sizeof(support), &support, &r_size);
    if (support != CL_TRUE)
    {
        puts("image not supported");
        return 1;
    }

    command_queue = clCreateCommandQueue(context, device_id, 0, &ret);
    fp = fopen("image.cl", "r");
    kernel_src_str = (char *)malloc(MAX_SOURCE_SIZE);
    kernel_code_size = fread(kernel_src_str, 1, MAX_SOURCE_SIZE, fp);
    fclose(fp);

    /* Create output buffer */
    out = clCreateBuffer(context, CL_MEM_READ_WRITE, sizeof(cl_float4) * num_out, NULL, &ret);

    /* Create data format for image creation */
    fmt.image_channel_order = CL_R;
    fmt.image_channel_data_type = CL_FLOAT;

    /* Create Image Object */
    image = clCreateImage2D(context, CL_MEM_READ_ONLY, &fmt, 4, 4, 0, 0, NULL);

    /* Set parameter to be used to transfer image object */
    size_t origin[] = {0, 0, 0}; /* Transfer target coordinate*/
    size_t region[] = {4, 4, 1}; /* Size of object to be transferred */

    float data[] = {
        /* Transfer Data */
        10,
        20,
        30,
        40,
        10,
        20,
        30,
        40,
        10,
        20,
        30,
        40,
        10,
        20,
        30,
        40,
    };

    /* Transfer to device */
    clEnqueueWriteImage(command_queue, image, CL_TRUE, origin, region, 4 * sizeof(float), 0, data, 0, NULL, NULL);

    /* Build program */
    program = clCreateProgramWithSource(context, 1, (const char **)&kernel_src_str,
                                        (const size_t *)&kernel_code_size, &ret);
    clBuildProgram(program, 1, &device_id, "", NULL, NULL);
    kernel = clCreateKernel(program, "image_test", &ret);

    /* Set Kernel Arguments */
    clSetKernelArg(kernel, 0, sizeof(cl_mem), (void *)&image);
    clSetKernelArg(kernel, 1, sizeof(cl_mem), (void *)&out);

    cl_event ev;
    clEnqueueTask(command_queue, kernel, 0, NULL, &ev);

    /* Retrieve result */
    clEnqueueReadBuffer(command_queue, out, CL_TRUE, 0, sizeof(cl_float4) * num_out, result, 0, NULL, NULL);

    for (i = 0; i < num_out; i++)
    {
        printf("%f,%f,%f,%f¥n", result[i * 4 + 0], result[i * 4 + 1], result[i * 4 + 2], result[i * 4 + 3]);
    }

    clReleaseMemObject(out);
    clReleaseMemObject(image);

    clReleaseKernel(kernel);
    clReleaseProgram(program);
    clReleaseCommandQueue(command_queue);
    clReleaseContext(context);

    free(kernel_src_str);
    free(result);

    return 0;
}
```

The result is the following (the result may vary slightly, since OpenCL does not guarantee precision of operations).

> 10.000000,0.000000,0.000000,1.000000
>
> 10.000000,0.000000,0.000000,1.000000
>
> 10.000000,0.000000,0.000000,1.000000
>
> 10.000000,0.000000,0.000000,1.000000
>
> 13.000000,0.000000,0.000000,1.000000
>
> 18.000000,0.000000,0.000000,1.000000
>
> 10.000000,0.000000,0.000000,1.000000
>
> 30.000000,0.000000,0.000000,1.000000
>
> 10.000000,0.000000,0.000000,1.000000

We will start the explanation from the host side.

> 041: /\* Check if the device support images \*/
>
> 042: clGetDeviceInfo(device\_id, CL\_DEVICE\_IMAGE\_SUPPORT, sizeof(support), \&support, \&r\_size);
>
> 043: if (support != CL\_TRUE) {
>
> 044: puts("image not supported");
>
> 045: return 1;
>
> 046: }

The above must be performed, as not all OpenCL implementation may support image objects. It is supported if CL\_DEVICE\_IMAGE\_SUPPORT returns CL\_TRUE \[17].

> 057: /\* Create data format for image creation \*/
>
> 058: fmt.image\_channel\_order = CL\_R;
>
> 059: fmt.image\_channel\_data\_type = CL\_FLOAT;

The above code sets the format of the image object. The format is of type cl\_image\_format, which is a struct containing two elements. "image\_channel\_order" sets the order of the element, and "image\_channel\_data\_type" sets the type of the element.

Each data in the image object is of a vector type containing 4 components. The possible values for "image\_channel\_order" are shown in **Table 5.6** below. The 0/1 value represent the fact that those components are set to 0.0f/1.0f. The X/Y/Z/W are the values that can be set for the format.

**Table 5.6: Possible values for "image\_channel\_order"**

| Enum values for channel order  | Corresponding Format  |
| ------------------------------ | --------------------- |
| CL\_R, CL\_Rx                  | (X,0,0,1)             |
| CL\_A                          | (0,0,0,X)             |
| CL\_RG, CL\_RGx                | (X,Y,0,1)             |
| CL\_RA                         | (X,0,0,Y)             |
| CL\_RGB, CL\_RGBx              | (X,Y,Z,1)             |
| CL\_RGBA,CL\_BGRA,CL\_ARGB     | (X,Y,Z,W)             |
| CL\_INTENSITY                  | (X,X,X,X)             |
| CL\_LUMINANCE                  | (X,X,X,1)             |

The values that can be set for "image\_channel\_data\_type" is shown in **Table 5.7** below. Of these, CL\_UNORM\_SHORT\_565, CL\_UNORM\_SHORT\_555, CL\_UNORM\_SHORT\_101010 can only be set when "image\_channel\_order" is set to "CL\_RGB".

**Table 5.7: Possible values for "image\_channel\_data\_types"**

| Image Channel Data Type   | Corresponding Type  |
| ------------------------- | ------------------- |
| CL\_SNORM\_INT8           | char                |
| CL\_SNORM\_INT16          | short               |
| CL\_UNORM\_INT8           | uchar               |
| CL\_UNORM\_INT16          | ushort              |
| CL\_UNORM\_SHORT\_565     | ushort (with RGB)   |
| CL\_UNORM\_SHORT\_555     | ushort (with RGB)   |
| CL\_UNORM\_SHORT\_101010  | uint (with RGB)     |
| CL\_SIGNED\_INT8          | char                |
| CL\_SIGNED\_INT16         | short               |
| CL\_SIGNED\_INT32         | int                 |
| CL\_UNSIGNED\_INT8        | uchar               |
| CL\_UNSIGNED\_INT16       | ushort              |
| CL\_UNSIGNED\_INT32       | uint                |
| CL\_FLOAT                 | float               |
| CL\_HALF\_FLOAT           | half                |

Now that the image format is specified, we are ready to create the image object.

> 061: /\* Create image object \*/
>
> 062: image = clCreateImage2D(context, CL\_MEM\_READ\_ONLY, \&fmt, 4, 4, 0, 0, NULL);

As shown above, image object is created using clCreateImage2D(). The arguments are the corresponding context, read/write permission, image data format, width, height, image row pitch, host pointer, and error code. Host pointer is used if the data already exists on the host, and the data is to be used directly from the kernel. If this is set, the image row pitch must be specified. The host pointer is not specified in this case.

Now the data for the image object is transferred from the host to device.

> 064: /\* Set parameter to be used to transfer image object \*/
>
> 065: size\_t origin\[] = {0, 0, 0}; /\* Transfer target coordinate\*/
>
> 066: size\_t region\[] = {4, 4, 1}; /\* Size of object to be transferred \*/
>
> 067:
>
> 068: float data\[] = { /\* Transfer Data \*/
>
> 069: 10, 20, 30, 40,
>
> 070: 10, 20, 30, 40,
>
> 071: 10, 20, 30, 40,
>
> 072: 10, 20, 30, 40,
>
> 073: };
>
> 074:
>
> 075: /\* Transfer to device \*/
>
> 076: clEnqueueWriteImage(command\_queue, image, CL\_TRUE, origin, region, 4\*sizeof(float), 0, data, 0, NULL, NULL);

The clEnqueueWriteImage() is used to transfer the image data. The arguments are command queue, image object, block enable, target coordinate, target size, input row pitch, input slice pitch, pointer to data to be transferred, number of events in wait list, event wait list, and event object. Refer to 4-1-3 for explanation on the block enable and events objects. The target coordinate and target size are specified in a 3-component vector of type size\_t. If the image object is 2-D, the 3rd component to target coordinate is 0, and the 3rd component to the size is 1.

Passing this image object into the device program will allow the data to be accessed.

Now we will go over the device program.

```
const sampler_t s_nearest = CLK_FILTER_NEAREST | CLK_NORMALIZED_COORDS_FALSE | CLK_ADDRESS_CLAMP_TO_EDGE; 
const sampler_t s_linear = CLK_FILTER_LINEAR | CLK_NORMALIZED_COORDS_FALSE | CLK_ADDRESS_CLAMP_TO_EDGE; 
const sampler_t s_repeat = CLK_FILTER_NEAREST | CLK_NORMALIZED_COORDS_FALSE | CLK_ADDRESS_REPEAT; 
```

The "sampler\_t" type defines a sampler object. OpenCL allows different modes on how image objects are read, and these properties are defined in this object type, which gets passed in as a parameter when reading an image object. The properties that can be set are the following.

• Filter Mode

• Normalize Mode

• Addressing Mode

The values that can be set for each property are shown in **Table 5.8** below.

**Table 5.8: Sampler Object Property Values**

****

| Sampler state         | Predefined Enums                | Description                                                                                          |
| --------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| \<filter mode>        | CLK\_FILTER\_NEAREST            | Use nearest defined coordinate                                                                       |
|                       | CLK\_FILTER\_LINEAR             | Interpolate between neighboring values                                                               |
| \<normalized coords>  | CLK\_NORMALIZED\_COORDS\_FALSE  | Unnormalized                                                                                         |
|                       | CLK\_NORMALIZED\_COORDS\_TRUE   | Normalized                                                                                           |
| \<address mode>       | CLK\_ADDRESS\_MIRRORED\_REPEAT  | Flip the image coordinate at every integer junction                                                  |
|                       | CLK\_ADDRESS\_REPEAT            | Out-of-range image coordinates wrapped to valid range                                                |
|                       | CLK\_ADDRESS\_CLAMP\_TO\_EDGE   | Out-of-range coord clamped to the extent                                                             |
|                       | CLK\_ADDRESS\_CLAMP             | Out-of-range coord clamped to border color                                                           |
|                       | CLK\_ADDRESS\_NONE              | Out-of-range coord undefined. Used to guarantee that only cation inside the image is referenced**.** |

The filter mode specifies the how non-exact coordinates are handled. The addressing mode specifies how out-of-range image coordinates are handled.

The filter mode decides how a value at non-exact coordinate is obtained. OpenCL defines the CLK\_FILTER\_NEAREST and CLK\_FILTER\_LINEAR modes. The CLK\_FILTER\_NEAREST mode determines the closest coordinate defined, and uses this coordinate to access the value at the coordinate. The CLK\_FILTER\_LINEAR mode interpolates the values from nearby coordinates (nearest 4 points if 2D and nearest 8 points if 3D).

The address mode decides what to do when a coordinate outside the range of the image is accessed. If CLK\_ADDRESS\_CLAMP is specified, then the returned value is determined based on the "image\_channel\_order", as shown in **Table 5.9**.

**Table 5.9: CLK\_ADDRESS\_CLAMP Result as a function of "image\_channel\_order"**

| Enum values for channel order                                                          | Clamp point               |
| -------------------------------------------------------------------------------------- | ------------------------- |
| CL\_A, CL\_INTENSITY, CL\_Rx, CL\_RA, CL\_RGx, CL\_RGBx, CL\_ARGB, CL\_BGRA, CL\_RGBA  | (0.0f, 0.0f, 0.0f, 0.0f)  |
| CL\_R, CL\_RG, CL\_RGB, CL\_LUMINANCE                                                  | (0.0f, 0.0f, 0.0f, 1.0f)  |

In our sample code, the input data is set to (10, 20, 30). Plot of the results for different sample modes are shown in **Figure 5.4**. As the figure shows, the central location for the data is data location + 0.5. For example, the central location for the 2nd data is 2.5.

The coordinates are normalized if the CLK\_NORMALIZED\_COORDS\_TRUE is specified. This normalizes the image object so that its coordinates are accessed by a value between 0 and 1.0. However, the normalization must be either enabled or disabled for all image reads within a kernel.

Now we are ready to read the image object.

> 010: out\[0] = read\_imagef(im, s\_nearest, (float2)(0.5f, 0.5f));
>
> 011: out\[1] = read\_imagef(im, s\_nearest, (float2)(0.8f, 0.5f));
>
> 012: out\[2] = read\_imagef(im, s\_nearest, (float2)(1.3f, 0.5f));

The image object can be read using the built-in functions read\_imagef(), read\_imagei(), or read\_imageui(). The format when the image object is read must match the format used when the object was created using clCreateImage2D. The formats are shown in **Table 5.10**. (Note: The action of the read\_image\*() function is undefined when there is a format mismatch)

**Figure 5.4: Sampler object examples**

![](<../.gitbook/assets/Screen Shot 2022-01-10 at 9.44.02 PM.png>)

**Table 5.10: Format to specify when reading an image object**

****

| Function         | Format             | Description                                                      |
| ---------------- | ------------------ | ---------------------------------------------------------------- |
| read\_imagef()   | CL\_SNORM\_INT8    | -127 \~ 127 normalized to -1.0 \~ 1.0 (-128 becomes -1.0)        |
|                  | CL\_SNORM\_INT16   | -32767 \~ 32767 normalized to -1.0 \~ 1.0 (-32768 becomes -1.0)  |
|                  | CL\_UNORM\_INT8    | 0 \~ 255 normalized to 0.0 \~ 1.0                                |
|                  | CL\_UNORM\_INT16   | 0 \~ 65535 normalized to 0.0 \~ 1.0                              |
|                  | CL\_FLOAT          | as is                                                            |
|                  | CL\_HALF\_FLOAT    | Half value converted to float                                    |
| read\_imagei()   | CL\_SIGNED\_INT8   | -128 \~ 127                                                      |
|                  | CL\_SIGNED\_INT16  | Half value converted to float                                    |
|                  | CL\_SIGNED\_INT32  | -2147483648 \~ 2147483647                                        |
| read\_imageui()  | CL\_SIGNED\_INT8   | 0 \~ 255                                                         |
|                  | CL\_SIGNED\_INT16  | 0 \~ 65535                                                       |
|                  | CL\_SIGNED\_INT32  | 0 \~ 4294967296                                                  |

The arguments of the read\_image\*() functions are the image object, sampler object, and the coordinate to read. The coordinate is specified as a float2 type. The returned type is float4, int4, or uint4 depending on the format.

## _Embedded Profile_

OpenCL is intended to not only to be used on desktops environments, but for embedded systems as well. However, it may not be possible to implement every functions defined in OpenCL for embedded systems. For this reason, OpenCL defines the Embedded Profile. The implementation that only supports the Embedded Profile may have the following restrictions.

• Rounding of floats

OpenCL typically uses the round-to-nearest-even method by default for rounding, but in the Embedded Profile, it may use the round-towards-zero method if the former is not implemented. This should be checked using the clGetDeviceInfo() function to get the "CL\_DEVICE\_SINGLE\_FP\_CONFIG" property. \


• Precision of Built-in functions

Some built-in functions may have lower precision than the precision defined in OpenCL.

• Other optional functionalities

In addition to the above, 3D image support, 64-bit long/ulong, float Inf and NaN may not be implemented, as they are optional. The result of operating on Inf or NaN is undefined, and will vary depending on the implementation.

## _Attribute Qualifiers_

OpenCL allows the usage of attribute qualifiers, which gives specific instructions to the compiler. This is a language extension to standard C that is supported in GCC.

> \_\_attribute\_\_(( value ))

This extension is starting to be supported by compilers other than GCC. The attribute can be placed on variables, types (typedef, struct), and functions.

Examples of an attribute being placed on types are shown below.

> typedef int aligned\_int\_t \_\_attribute\_\_((aligned(16)));
>
> typedef struct \_\_attribute\_\_(((packed))) packed\_struct\_t { ... };

Below is an example of an attribute being placed on a variable.

> int a \_\_attribute\_\_((aligned(16)));

The basic grammar is to place an attribute after the variable, type or function to set the attribute to.

The attributes that can be set in OpenCL are shown below.

• aligned

Same as the "aligned" in GCC. When specified on a variable, the start address of that variable gets aligned. When specified on a type, the start address of that type gets aligned. This attribute on a function is undefined in OpenCL.

• packed

Same as the "packed" in GCC. When specified on a variable, the address between this variable and the previously defined variable gets padded. When specified on a struct, each member in the struct gets padded.

• endian

This specifies the byte order used on a variable. "host" or "device" can be passed in as an argument to make the byte order the same as either host or device.

There are also other attributes defined for function, which gives optimization hints to the compiler. Some hints are given below:

• vec\_type\_hint()

Suggests the type of vector to use for optimization

• work\_group\_size\_hint()

Suggests the number of work-items/work-group.

• reqd\_work\_group\_size()

Specifies the number of work-items/work-group. The kernel will throw an error when the number of work-items/work-group is a different number. (1,1,1) should be specified if the kernel is queued using clEnqueueTask().

## _Pragma_

OpenCL defines several pragmas. The syntax is to use "#pragma OPENCL". 2 pragmas, FP\_CONTRACT, and EXTENSION are defined.

### **FP\_CONTRACT**

This is the same as the FP\_CONTRACT defined in standard C.

> \#pragma OPENCL FP\_CONTRACT on-off-switch

Some hardware supports "FMA" instructions, which sums a number with the product of 2 numbers in one instruction. These types of instructions, where multiple operations are performed as 1 operation, are known as contract operations. In some cases, the precision may be different from when the operations are performed separately. This FP\_CONTRACT pragma enables or disables the usage of these contract operations.

### **EXTENSION**

This enables or disables optional OpenCL extensions to be used.

\#pragma OPENCL EXTENSION \<extension\_name> : \<behavior>

\<extension\_name> gets the name of the OpenCL extension. The standard extensions are shown in **Table 5.11** below.

**Table 5.11: Extension name**



| Extension name                                                                    | Extended capability                             |
| --------------------------------------------------------------------------------- | ----------------------------------------------- |
| cl\_khr\_fp64                                                                     | Support for double precision                    |
| cl\_khr\_fp16                                                                     | Support for half precision                      |
| cl\_khr\_select\_fprounding\_mode                                                 | Support for setting the rounding type           |
| cl\_khr\_global\_int32\_base\_atomics, cl\_khr\_global\_int32\_extended\_atomics  | Support for atomic operations of 32-bit values  |
| cl\_khr\_global\_int64\_base\_atomics, cl\_khr\_global\_int64\_extended\_atomics  | Support for atomic operations of 64-bit values  |
| cl\_khr\_3d\_image\_writes                                                        | Enable writes to 3-D image object               |
| cl\_khr\_byte\_addressable\_store                                                 | Enable byte-size writes to address              |
| All                                                                               | Support for all extensions                      |

\<behavior> gets one of the value on **Table 5.12**. Specifying "require" when the enabled extension is "all" will display an error.

**Table 5.12: Supported values for \<behavior>**

| Behavior  | Description                                                  |
| --------- | ------------------------------------------------------------ |
| Require   | Check that extension is supported (compile error otherwise)  |
| Disable   | Disable extensions                                           |
| Enable    | Enable extensions                                            |
