# Parallel Computing (Software)

Up until this section, hardware architectures that involve performing one task using numerous processors have been the focus. This section will focus on how to program in parallel on those discussed hardware architectures.

### _Sequential vs Parallel Processing_&#x20;

Let us take a look at the pseudocode below.

**List 1.1: Pseudocode for parallel processing**&#x20;

```
for(i=0;i<N;i++){
    resultA = task_a(i);
    resultB = task_b(i);
    resultC = task_c(i);
    resultD = task_d(i);
    resultAll += resultA + resultB + resultC + resultD;
}
```

Executing the code above on a single-core, single-CPU processor (SISD system), the 4 tasks would be run sequentially in the order task\_a, task\_b, task\_c, task\_d, and the returned values then summed up. This is repeated N times, incrementing i after each iteration. This type of method is called "sequential processing". The process of running the code with N=4 is shown on the left hand side of **Figure 1.3**.&#x20;

This type of code can benefit from parallelization. If this code is compiled without adding any options for optimization on a dual-core system, the program would still run sequentially on only one core. In this scenario, since the other core has nothing to do, it idles. This is clearly inefficient, so the intuitive thing to do here is to split the task into 2 subtasks, and run each subtasks on one core each. This is the basis of parallel programming. As shown in **Figure 1.13**, the task is split up into 2 such that each subtask runs the loop N/2 times, and then performs the sum at the end.&#x20;

**Figure 1.13: Parallel processing example**&#x20;

![](<../.gitbook/assets/Screen Shot 2021-12-21 at 9.57.49 AM.png>)

For actual implementation of parallel programs, it is necessary to follow the following steps.&#x20;

1\. Analyze the dependencies within the data structures or within the processes, etc, in order to decide which sections can be executed in parallel.&#x20;

2\. Decide on the best algorithm to execute the code over multiple processors.&#x20;

3\. Rewrite the code using frameworks such as Message Passing Interface (MPI), OpenMP, or OpenCL.&#x20;

In the past, these skills were required only by a handful of engineers, but since multi-core processors are becoming more common, the use of these distributed processing techniques is becoming necessary more often. The following sections will introduce basic concepts required to implement parallel processing.

### _Where to Parallelize?_&#x20;

During the planning phase of parallel programs, certain existing laws must be taken into account. The first law states that if a program spends y% of the time running code that cannot be executed in parallel, the expected speedup from parallelizing is at best a 1/y fold improvement. The law can be proven as follows. Let Ts represent the time required to run the portion of the code that cannot be parallelized, and let Tp represent the time required to run the portion of the code that can benefit from parallelization. Running the program on 1 processor, the processing time is:&#x20;

> T(1) = Ts + Tp

And the processing time when using N processors is:

> T(N) = Ts + Tp/N

Using y, the proportion of time spent running code that cannot be parallelized, the speedup S achieved is:

> S = T(1)/T(N) = T(1)/(Ts + Tp/N) = 1/(y+(1-y)/N)

Taking the limit as N goes to infinity, the highest speedup that can be achieved is S=1/y. This law is known as Amdahl's law \[6].&#x20;

For a more concrete example, assume that some sequential code were being rewritten to run on a quad-core CPU. Ideally, a 4-times speedup would be achieved. However, as the law states, the speedup is limited by the portion of the code that must be run sequentially. **Figure 1.4** shows the 2 cases where the proportion of the code that cannot be run in parallel (y) is 10% and 50%. Even without taking overhead into account, the figure shows a difference of 3x and 1.3x speedup depending on y.&#x20;

**Figure 1.14: Example of Amdahl's law**&#x20;

![](<../.gitbook/assets/Screen Shot 2021-12-21 at 9.08.56 PM.png>)

This problem becomes striking as the number of processors increases. For a common 2-way server that uses Intel's Xeon 5500 Series CPUs which supports hyper-threading, the OS sees 16 cores. GPUs such as NVIDIA's Tesla can have more than 200 cores. **Figure 1.15** shows the speedup achieved as a function of the sequentially processed percentage y and the number of cores. The graph clearly shows the importance of reducing the amount of sequentially processed portions, especially as the number of cores is increased. This also implies that the effort used for parallelizing a portion of the code that does not take up a good portion of the whole process may be in vain. In summary, it is more important to reduce serially processed portions rather than parallelizing a small chunk of the code.&#x20;

![](<../.gitbook/assets/Screen Shot 2021-12-21 at 9.10.03 PM.png>)

While Amdahl's law gives a rather pessimistic impression of parallel processing, Gustafson's law provides a more optimistic view. This law states that as the program size increases, the fraction of the program that can run in parallel also increases, thereby decreasing the portion that must be performed sequentially. Recall the previously stated equation:

> T(N) = Ts + Tp/N

Gustafson states that of the changes in T(N), Ts is directly proportional to the program size, while Tp grows faster than Ts. For example, assume a program where a portion that must be run sequentially is limited to initialization and closing processes, and all other processes can be performed in parallel. By increasing the amount of data to process by the program, it is apparent that Gustafson's law holds true. In other words, Gustafson's law shows that in order to efficiently execute code over multiple processors, large-scale processing must take place. Development of parallel programming requires close attention to these 2 laws.

### _Types of Parallelism_&#x20;

After scrutinizing the algorithm and deciding where to parallelize, the next step is to decide on the type of parallelism to use.

Parallel processing requires splitting up the data to be handled, and/or the process itself. Please refer back to the code of **List 1.1**. This time, assume a quad-core CPU running 4 processes simultaneously. An intuitive approach is to let each processor perform N/4 iterations of the loop, but since there are 4 tasks within the loop, it also makes just as much sense to run each of these tasks in each processor. The former method is called "data parallel", while the latter is called "task parallel" (**Figure 1.16**).&#x20;

**Figure 1.16: Data parallel vs task parallel**&#x20;

![](<../.gitbook/assets/Screen Shot 2021-12-21 at 9.18.32 PM.png>)

### **Data Parallel**&#x20;

Main characteristics of data parallel method is that the programming is relatively simple since multiple processors are all running the same program, and that all processors finish their task at around the same time. This method is efficient when the dependency between the data being processed by each processor is minimal. For example, vector addition can benefit greatly from this method. As illustrated in **Figure 1.17**, the addition at each index can be performed completely independently of each other. For this operation, the number of processors is directly proportional to the speedup that may be achieved if overhead from parallelization can be ignored. Another, more concrete example where this method can be applied is in image processing. The pixels can be split up into blocks, and each of these blocks can be filtered in parallel by each processor.&#x20;

**Figure 1.17: Vector Addition**&#x20;

![](<../.gitbook/assets/Screen Shot 2021-12-21 at 9.25.50 PM.png>)

### **Task Parallel**&#x20;

The main characteristic of the task parallel method is that each processor executes different commands. This increases the programming difficulty when compared to the data parallel method. Since the processing time may vary depending on how the task is split up, it is actually not suited for the example shown in **Figure 1.16**. Also, since task\_a and task\_c are doing nothing until task\_b and task\_d finishes, the processor utilization is decreased. Task parallel method requires a way of balancing the tasks to take full advantage of all the cores. One way is to implement a load balancing function on one of the processors. In the example in **Figure 1.18**, the load balancer maintains a task queue, and assigns a task to a processor that has finished its previous task.&#x20;

**Figure 1.18: Load Balancing**&#x20;

![](<../.gitbook/assets/Screen Shot 2021-12-21 at 9.27.22 PM.png>)

Another method for task parallelism is known as pipelining. Pipelining is usually in reference to the "instruction pipeline" where multiple instructions, such as instruction decoding, arithmetic operation, and register fetch, are executed in an overlapped fashion over multiple stages. This concept can be used in parallel programming as well.&#x20;

**Figure 1.19** shows a case where each processor is given its own task type that it specializes in. In this example, the start of each task set is shifted in the time domain, such that task\_b, task\_c, task\_d takes in the output of task\_a, task\_b, task\_c as an input. The data moves as a stream across the processors. This method is not suited for the case where only one set of tasks is performed, but can be effective when processing, for example, videos, where processing frames are taken as inputs one after another.&#x20;

![](<../.gitbook/assets/Screen Shot 2021-12-21 at 9.28.39 PM.png>)

### **Hardware Dependencies**&#x20;

When porting sequential code to parallel code, the hardware must be decided wisely. Programs usually have sections suited for data parallelism as well as for task parallelism, and the hardware is usually suited for one or the other.&#x20;

For example, the GPU is suited for data parallel algorithms, due to the existence of many cores. However, since the GPU is not suited for performing different tasks in parallel, the CPU is more suited for performing task parallel algorithms, since its 8 cores are capable of working independently of each other.&#x20;

OpenCL allows the same code to be executed on either platforms, but since it cannot change the nature of the hardware, the hardware and the parallelization method must be chosen wisely.

### _Implementing a Parallel Program_&#x20;

After deciding on the parallelization method, the next step is the implementation. In decreasing order of user involvement:&#x20;

1\. Write parallel code using the operating system's functions.&#x20;

2\. Use a parallelization framework for program porting.&#x20;

3\. Use an automatic-parallelization compiler.&#x20;

This section will explore the different methods.&#x20;

**Parallelism using the OS System Calls**&#x20;

Implementing parallel programs using the OS system call requires, at minimum, a call to execute and close a program, and some way of transferring data between the executed programs. If this is done on a cluster system, the data transfer between programs is performed using network transfer APIs such as the socket system call, but this is commonly done using a framework instead.&#x20;

For performing parallel instructions performed within the processor itself, however, the OS system call may be used instead of the framework. The code can be further broken down into "parallel processes" and "parallel threads" to be run on the processor. The difference between processes and threads are as follows.&#x20;

A process is an executing program given its own address space by the operating system. In general, the operating system performs execution, closing, and interruption within these process units, making sure each of these processes' distinct resources do not interfere with each other. Data transfer between programs may be performed by a system call to the operating system. For example, UNIX provides a system call shmget() that allocates shared memory that can be accessed by different processes.&#x20;

A thread is a subset of a process that is executed multiple times within the program. These threads share the same address space as the processes. In general, since these threads execute in the same memory space, the overhead from starting and switching is much smaller than when compared to processes. In general, the operating system provides an API to create and manage these threads. For example, UNIX provides a library called Pthreads, which is a POSIX-approved thread protocol. POSIX is a standard for API specified by IEEE.&#x20;

Whether to use parallel processes or parallel threads within a processor depends on the case, but in general, parallel threads are used if the goal is speed optimization, due to the light overhead.&#x20;

**List 1.2** shows an example where each member of an array is incremented using multithreading.&#x20;

**List 1.2: pthread example**&#x20;

```
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>

#define TH_NUM 4
#define N 100

static void *thread_increment(void *array)
{
int i;
int *iptr;

iptr = (int *)array;
for(i=0;i< N / TH_NUM;i++) iptr[i] += 1;

return NULL;
}

int main(void) 
{ 
int i; 
pthread_t thread[TH_NUM]; 

int array[N]; 

/* initialize array*/ 
for(i=0;i<N;i++){ 
array[i] = i; 
} 

/* Start parallel process */ 
for(i=0;i<TH_NUM;i++){ 
if (pthread_create(&thread[i], NULL, thread_increment, array + i * N / TH_NUM) != 0) 
{ 
return 1; 
} 
} 

/* Synchronize threads*/ 
for(i=0;i<TH_NUM;i++){ 
if (pthread_join(thread[i], NULL) != 0) 
{ 
return 1; 
} 
} 

return 0; 
}
```

The code is explained below.&#x20;

003: Include file required to use the pthread API&#x20;

008-017: The code ran by each thread. It increments each array elements by one. The start index is passed in as an argument.&#x20;

022: Declaration of pthread\_t variable for each thread. This is used in line 033. The OpenCL Programming Book 32&#x20;

032-037: Creation and execution of threads. In line 033, the third argument is the name of the function to be executed by the thread, and the fourth argument is the argument passed to the thread.&#x20;

039-045: Waits until all threads finish executing&#x20;

### **Parallelism using a Framework**&#x20;

Many frameworks exist to aid in parallelization, but the ones used in practical applications, such as in research labs and retail products, are limited. The most widely used frameworks are Message Passing Interface (MPI) for cluster servers, OpenMP for shared memory systems (SMP, NUMA), and the parallelization APIs in Boost C++. These frameworks require the user to specify the section as well as the method used for parallelization, but take care of tasks such as data transfer and execution of the threads, allowing the user to focus on the main core of the program.&#x20;

**List 1.3** shows an example usage of OpenMP, which is supported by most mainstream compilers, such as GCC, Intel C, Microsoft C. From the original sequential code, the programmer inserts a "#pragma" directive, which explicitly tells the compiler which sections to run in parallel. The compiler then takes care of the thread creation and the commands for thread execution.&#x20;

**List 1.3: OpenMP Example**&#x20;

> 001: #include\<stdio.h>&#x20;
>
> 002: #include\<stdlib.h>&#x20;
>
> 003: #include\<omp.h>&#x20;
>
> 004: #define N 100&#x20;
>
> 005: #define TH\_NUM 4&#x20;
>
> 006:&#x20;
>
> 007: int main ()&#x20;
>
> 008: {&#x20;
>
> 009: int i;&#x20;
>
> 010: int rootBuf\[N];&#x20;
>
> 011:&#x20;
>
> 012: omp\_set\_num\_threads(TH\_NUM);&#x20;
>
> 013:&#x20;
>
> 014: /\* Initialize array\*/&#x20;
>
> 015: for(i=0;i\<N;i++){&#x20;
>
> 016: rootBuf\[i] = i;&#x20;
>
> 017: }&#x20;
>
> 018:&#x20;
>
> 019: /\* Parallel process \*/&#x20;
>
> 020: #pragma omp parallel for&#x20;
>
> 021: for (i = 0; i < N; i++) {&#x20;
>
> 022: rootBuf\[i] = rootBuf\[i] + 1;&#x20;
>
> 023: }&#x20;
>
> 024:&#x20;
>
> 025: return(0);&#x20;
>
> 026: }&#x20;

When compiling the above code, the OpenMP options must be specified. GCC (Linux) requires "-fopenmp", intel C (Linux) requires "-openmp", and Microsoft Visual C++ requires /OpenMP. The code is explained below.&#x20;

003: Include file required to use OpenMP&#x20;

004: Size of the array, and the number of times to run the loop. In general, this number should be somewhat large to benefit from parallelism.&#x20;

012: Specify the number of threads to be used. The argument must be an integer.&#x20;

020: Breaks up the for loops that follows this directive, into the number of threads specified in 012.&#x20;

This example shows how much simpler the programming becomes if we use the OpenMP framework. Compare with **List 1.2** that uses pthreads.&#x20;

### **Automatic parallelization compiler**&#x20;

Compilers exist that examines for-loops to automatically decide sections that can be run in parallel, as well as how many threads to use.&#x20;

For example, Intel C/C++ compiler does this when the option is sent.&#x20;

(On Linux)&#x20;

> icc -parallel -par-report3 -par-threshold0 -03 o parallel\_test parallel\_test.c

(Windows)

> Icc /Qparallel /Qpar-report3 /Q-par-threshold0 -03 o parallel\_test parallel\_test.c

The explanations for the options are discussed below.&#x20;

• -parallel: Enables automatic parallelization&#x20;

• -par-report3: Reports which section of the code was parallelized. There are 3 report levels, which can be specified in the form -par-report\[n]&#x20;

• -par-threshold0: Sets the threshold to decide whether some loops are parallelized. In order to benefit from parallelization, enough computations must be performed within each loop to hide the overhead from process/thread creation. This is specified in the form -par-threshold\[n]. The value for n must be between 0 \~ 100, with higher number implying higher number of computations. When this value is 0, all sections that can be parallelized become parallelized. The default value is 75.&#x20;

At a glance, the automatic parallelization compiler seems to be the best solution since it does not require the user to do anything, but in reality, as the code becomes more complex, the compiler has difficulty finding what can be parallelized, making the performance suffer. As of January 2012, no existing compiler (at least no commercial) can auto-generate parallel code for hybrid systems such as the accelerator1.&#x20;

****
